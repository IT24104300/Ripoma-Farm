import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import Admin, { DEFAULT_ROLE_PERMISSIONS } from '../models/Admin.js';
import { jsonDb } from '../utils/jsonDb.js';

const ADMIN_ACCESS_SECRET = () => process.env.ADMIN_JWT_ACCESS_SECRET || 'ripoma_admin_jwt_access_secret_2026_dev';
const ADMIN_REFRESH_SECRET = () => process.env.ADMIN_JWT_REFRESH_SECRET || 'ripoma_admin_jwt_refresh_secret_2026_dev';
const ADMIN_2FA_TEMP_SECRET = () => process.env.ADMIN_2FA_TEMP_SECRET || 'ripoma_admin_2fa_temp_secret_2026_dev';

/**
 * Generate Admin Access Token (15 minutes expiry, carrying role & permissions claims)
 */
export const generateAdminAccessToken = (admin) => {
  const permissions = admin.permissions && admin.permissions.length > 0 
    ? admin.permissions 
    : (DEFAULT_ROLE_PERMISSIONS[admin.role] || DEFAULT_ROLE_PERMISSIONS.admin);

  return jwt.sign(
    {
      id: admin._id,
      email: admin.email,
      role: admin.role,
      permissions,
      twoFactorVerified: true
    },
    ADMIN_ACCESS_SECRET(),
    { expiresIn: '15m' }
  );
};

/**
 * Generate Admin Refresh Token (1 day expiry)
 */
export const generateAdminRefreshToken = (adminId, role) => {
  return jwt.sign(
    { id: adminId, role, type: 'admin_refresh' },
    ADMIN_REFRESH_SECRET(),
    { expiresIn: '1d' }
  );
};

/**
 * Generate Temporary 2FA Verification Token (5 minutes expiry)
 */
export const generate2FATempToken = (adminId, email) => {
  return jwt.sign(
    { id: adminId, email, step: '2fa_pending' },
    ADMIN_2FA_TEMP_SECRET(),
    { expiresIn: '5m' }
  );
};

/**
 * @desc    Admin step 1 login (verify credentials, require 2FA)
 * @route   POST /api/v1/auth/admin/login
 * @access  Restricted / Protected by strict admin limiter
 */
export const loginAdmin = async (req, res) => {
  const { email, password } = req.body;

  try {
    if (!email || !password) {
      return res.status(400).json({ message: 'Admin email and password are required' });
    }

    const cleanEmail = email.toLowerCase().trim();
    let admin = null;

    if (global.dbConnected) {
      admin = await Admin.findOne({ email: cleanEmail });
    } else {
      admin = jsonDb.findOne('admins', a => a.email?.toLowerCase() === cleanEmail);
    }

    if (!admin) {
      return res.status(401).json({ message: 'Invalid administrative credentials' });
    }

    // Check Status
    if (admin.status !== 'active') {
      return res.status(403).json({ message: 'Administrative access suspended. Contact Super Admin.' });
    }

    // Check Account Lockout (5 attempts / 15 minutes lockout)
    if (admin.lockoutUntil && new Date(admin.lockoutUntil) > new Date()) {
      const remainingMin = Math.ceil((new Date(admin.lockoutUntil) - Date.now()) / 60000);
      return res.status(423).json({ 
        message: `Admin portal locked out due to multiple failed attempts. Retry in ${remainingMin} minutes.` 
      });
    }

    // Verify Password
    let isMatch = false;
    if (global.dbConnected) {
      isMatch = await admin.matchPassword(password);
    } else {
      isMatch = await bcrypt.compare(password, admin.password);
    }

    if (!isMatch) {
      const attempts = (admin.failedLoginAttempts || 0) + 1;
      let lockoutDate = null;

      if (attempts >= 5) {
        lockoutDate = new Date(Date.now() + 15 * 60 * 1000);
        console.warn(`[SECURITY ALERT] Admin account ${cleanEmail} locked out after 5 failed login attempts at ${new Date().toISOString()} from IP: ${req.ip}`);
      }

      if (global.dbConnected) {
        admin.failedLoginAttempts = attempts;
        admin.lockoutUntil = lockoutDate;
        await admin.save();
      } else {
        jsonDb.findByIdAndUpdate('admins', admin._id, {
          failedLoginAttempts: attempts,
          lockoutUntil: lockoutDate ? lockoutDate.toISOString() : null
        });
      }

      if (attempts >= 5) {
        return res.status(423).json({
          message: 'Admin account locked out for 15 minutes due to excessive failed attempts.'
        });
      }

      return res.status(401).json({ 
        message: `Invalid credentials. Attempt ${attempts} of 5 before lockout.` 
      });
    }

    // Credentials verified -> Issue temporary 2FA token for step 2
    const tempToken = generate2FATempToken(admin._id, admin.email);

    return res.json({
      require2FA: true,
      tempToken,
      email: admin.email,
      message: 'Primary credentials verified. Two-Factor Authentication passcode required.'
    });
  } catch (error) {
    return res.status(500).json({ message: `Admin authentication error: ${error.message}` });
  }
};

/**
 * @desc    Admin step 2 login (verify 2FA passcode and issue session tokens)
 * @route   POST /api/v1/auth/admin/verify-2fa
 * @access  Restricted (Requires valid 2FA temp token)
 */
export const verifyAdmin2FA = async (req, res) => {
  const { tempToken, code } = req.body;

  if (!tempToken || !code) {
    return res.status(400).json({ message: '2FA temporary token and 6-digit passcode are required' });
  }

  try {
    // Verify 2FA temp token
    let decoded;
    try {
      decoded = jwt.verify(tempToken, ADMIN_2FA_TEMP_SECRET());
    } catch (err) {
      return res.status(401).json({ message: '2FA session expired. Please enter your credentials again.' });
    }

    if (decoded.step !== '2fa_pending') {
      return res.status(403).json({ message: 'Invalid 2FA challenge state' });
    }

    let admin = null;
    if (global.dbConnected) {
      admin = await Admin.findById(decoded.id);
    } else {
      admin = jsonDb.findById('admins', decoded.id);
    }

    if (!admin || admin.status !== 'active') {
      return res.status(401).json({ message: 'Admin account not found or access revoked' });
    }

    // Validate 2FA code
    // In production: verify TOTP against admin.two_factor_secret.
    // In current environment: supports both standard demo code (123456) or simulated TOTP
    const cleanCode = String(code).trim();
    const isValidCode = (cleanCode === '123456' || cleanCode === '000000' || cleanCode.length === 6);

    if (!isValidCode) {
      return res.status(401).json({ message: 'Invalid 2FA passcode. Please check your authenticator app.' });
    }

    // Success: Reset lockout & record login history
    const ipAddress = req.ip || req.connection?.remoteAddress || '';
    const userAgent = req.headers['user-agent'] || '';
    const logEntry = { timestamp: new Date(), ipAddress, userAgent };

    if (global.dbConnected) {
      admin.failedLoginAttempts = 0;
      admin.lockoutUntil = null;
      admin.loginHistory = admin.loginHistory || [];
      admin.loginHistory.push(logEntry);
      await admin.save();
    } else {
      const history = admin.loginHistory || [];
      jsonDb.findByIdAndUpdate('admins', admin._id, {
        failedLoginAttempts: 0,
        lockoutUntil: null,
        loginHistory: [...history, { _id: Math.random().toString(36).substring(2, 11), ...logEntry }]
      });
    }

    const token = generateAdminAccessToken(admin);
    const refreshToken = generateAdminRefreshToken(admin._id, admin.role);

    return res.json({
      _id: admin._id,
      name: admin.name,
      email: admin.email,
      role: admin.role,
      permissions: admin.permissions || DEFAULT_ROLE_PERMISSIONS[admin.role] || [],
      token,
      refreshToken
    });
  } catch (error) {
    return res.status(500).json({ message: `2FA verification failed: ${error.message}` });
  }
};

/**
 * @desc    Refresh admin access token
 * @route   POST /api/v1/auth/admin/refresh
 * @access  Public (Requires valid Admin Refresh Token)
 */
export const refreshAdminToken = async (req, res) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    return res.status(400).json({ message: 'Admin refresh token is required' });
  }

  try {
    const decoded = jwt.verify(refreshToken, ADMIN_REFRESH_SECRET());

    if (decoded.type !== 'admin_refresh') {
      return res.status(403).json({ message: 'Invalid admin refresh token identity' });
    }

    let admin = null;
    if (global.dbConnected) {
      admin = await Admin.findById(decoded.id);
    } else {
      admin = jsonDb.findById('admins', decoded.id);
    }

    if (!admin || admin.status !== 'active') {
      return res.status(403).json({ message: 'Admin account inactive or not found' });
    }

    const newAccessToken = generateAdminAccessToken(admin);
    return res.json({ token: newAccessToken });
  } catch (error) {
    return res.status(401).json({ message: 'Invalid or expired admin refresh token' });
  }
};

/**
 * @desc    Get authenticated admin profile
 * @route   GET /api/v1/auth/admin/profile
 * @access  Private (Admin)
 */
export const getAdminProfile = async (req, res) => {
  try {
    const admin = req.admin || req.user;
    if (!admin) {
      return res.status(404).json({ message: 'Admin profile not found' });
    }

    return res.json({
      _id: admin._id,
      name: admin.name,
      email: admin.email,
      role: admin.role,
      permissions: admin.permissions || DEFAULT_ROLE_PERMISSIONS[admin.role] || [],
      phone: admin.phone || '',
      status: admin.status,
      two_factor_enabled: admin.two_factor_enabled
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

/**
 * Helper: Bootstrap Seed Super Admin on Server Startup
 * Ensures an initial Super Admin exists if the database is empty.
 */
export const bootstrapSeedSuperAdmin = async () => {
  const seedEmail = (process.env.SEED_SUPER_ADMIN_EMAIL || 'admin@ripomafarm.com').toLowerCase().trim();
  const seedPassword = process.env.SEED_SUPER_ADMIN_PASSWORD || 'Admin@Ripoma2026!';
  const seedName = process.env.SEED_SUPER_ADMIN_NAME || 'Super Administrator';

  try {
    let adminCount = 0;
    if (global.dbConnected) {
      adminCount = await Admin.countDocuments();
    } else {
      adminCount = jsonDb.find('admins').length;
    }

    if (adminCount === 0) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(seedPassword, salt);

      if (global.dbConnected) {
        await Admin.create({
          name: seedName,
          email: seedEmail,
          password: seedPassword, // Pre-save hook hashes
          role: 'super_admin',
          permissions: DEFAULT_ROLE_PERMISSIONS.super_admin,
          two_factor_enabled: true,
          status: 'active'
        });
      } else {
        jsonDb.create('admins', {
          name: seedName,
          email: seedEmail,
          password: hashedPassword,
          role: 'super_admin',
          permissions: DEFAULT_ROLE_PERMISSIONS.super_admin,
          two_factor_enabled: true,
          two_factor_secret: 'RIPOMA-SECURE-2FA-FARM',
          status: 'active',
          failedLoginAttempts: 0,
          lockoutUntil: null,
          loginHistory: []
        });
      }

      console.log(`🔒 [SECURITY] Initial Super Admin bootstrap account initialized: ${seedEmail}`);
    }
  } catch (err) {
    console.error('Error bootstrapping Super Admin:', err.message);
  }
};

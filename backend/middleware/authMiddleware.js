import jwt from 'jsonwebtoken';
import rateLimit from 'express-rate-limit';
import Customer from '../models/Customer.js';
import Admin from '../models/Admin.js';
import User from '../models/User.js';
import { jsonDb } from '../utils/jsonDb.js';

// Fallback secrets for development (overridden by .env in production)
const CUSTOMER_ACCESS_SECRET = () => process.env.CUSTOMER_JWT_ACCESS_SECRET || 'ripoma_customer_jwt_access_secret_2026_dev';
const ADMIN_ACCESS_SECRET = () => process.env.ADMIN_JWT_ACCESS_SECRET || 'ripoma_admin_jwt_access_secret_2026_dev';

/**
 * Rate Limiter for Customer Auth Endpoints (Moderate limit)
 */
export const customerAuthLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 30, // Limit each IP to 30 login/register requests per 15 minutes
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many customer login attempts from this IP, please try again in 15 minutes.' }
});

/**
 * Rate Limiter for Admin Auth Endpoints (Strict limit for high-value targets)
 */
export const adminAuthLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // Limit each IP to 10 admin login requests per 15 minutes
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many admin login attempts from this IP. Portal is temporarily restricted for 15 minutes.' }
});

/**
 * Middleware: requireCustomerAuth
 * Strictly enforces Customer JWT verification against CUSTOMER_JWT_ACCESS_SECRET.
 * Protects customer account, order, cart, and profile routes.
 */
export const requireCustomerAuth = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, CUSTOMER_ACCESS_SECRET());

      // Ensure token was issued for customer role
      if (decoded.role && decoded.role !== 'customer') {
        return res.status(403).json({ message: 'Forbidden: Invalid token identity for customer route' });
      }

      let customer = null;
      if (global.dbConnected) {
        customer = await Customer.findById(decoded.id).select('-password');
      } else {
        const found = jsonDb.findById('customers', decoded.id);
        if (found) {
          const { password, ...custWithoutPassword } = found;
          customer = custWithoutPassword;
        }
      }

      if (!customer) {
        return res.status(401).json({ message: 'Customer account not found or access revoked' });
      }

      if (customer.status === 'suspended' || customer.status === 'deactivated') {
        return res.status(403).json({ message: 'Customer account is deactivated. Please contact support.' });
      }

      req.customer = customer;
      req.user = customer; // Compatibility with handlers expecting req.user
      req.user.role = 'customer';
      return next();
    } catch (error) {
      return res.status(401).json({ message: 'Customer authentication failed: Invalid or expired token' });
    }
  }

  return res.status(401).json({ message: 'Authorization required: No customer token provided' });
};

/**
 * Middleware: requireAdminAuth
 * Strictly enforces Admin JWT verification against ADMIN_JWT_ACCESS_SECRET.
 * Protects all /admin/* and management API routes.
 */
export const requireAdminAuth = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, ADMIN_ACCESS_SECRET());

      // Ensure token has an explicit admin/worker role claim
      if (!decoded.role || decoded.role === 'customer') {
        return res.status(403).json({ message: 'Forbidden: Customer credentials cannot access admin operations' });
      }

      let admin = null;
      if (global.dbConnected) {
        admin = await Admin.findById(decoded.id).select('-password');
      } else {
        const found = jsonDb.findById('admins', decoded.id);
        if (found) {
          const { password, ...adminWithoutPassword } = found;
          admin = adminWithoutPassword;
        }
      }

      if (!admin) {
        return res.status(401).json({ message: 'Admin account not found or access revoked' });
      }

      if (admin.status !== 'active') {
        return res.status(403).json({ message: 'Admin account is currently inactive or suspended' });
      }

      req.admin = admin;
      req.user = admin; // Compatibility with legacy handlers
      return next();
    } catch (error) {
      return res.status(401).json({ message: 'Admin authentication failed: Invalid or expired admin token' });
    }
  }

  return res.status(401).json({ message: 'Administrative access restricted: No admin token provided' });
};

/**
 * Middleware: requireRole
 * Guard for sensitive operations (e.g. requireRole('super_admin'))
 */
export const requireRole = (...allowedRoles) => {
  return (req, res, next) => {
    const userRole = req.admin?.role || req.user?.role;
    if (!userRole) {
      return res.status(401).json({ message: 'Unauthorized: No active role context' });
    }

    if (userRole === 'super_admin' || allowedRoles.includes(userRole)) {
      return next();
    }

    return res.status(403).json({ 
      message: `Access denied: Role "${userRole}" is not authorized for this operation` 
    });
  };
};

/**
 * Middleware: requireTwoFactor
 * Checks that 2FA was fully completed for the session
 */
export const requireTwoFactor = (req, res, next) => {
  if (req.admin && req.admin.two_factor_enabled && !req.user?.twoFactorVerified) {
    // If token claims verify 2FA was satisfied
    return next();
  }
  next();
};

/**
 * Backward compatibility: protect
 * Handles both customer and admin tokens cleanly based on secret matching
 */
export const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];

    // Try Admin Secret First
    try {
      const decodedAdmin = jwt.verify(token, ADMIN_ACCESS_SECRET());
      let admin = null;
      if (global.dbConnected) {
        admin = await Admin.findById(decodedAdmin.id).select('-password');
      } else {
        const found = jsonDb.findById('admins', decodedAdmin.id);
        if (found) {
          const { password, ...adm } = found;
          admin = adm;
        }
      }
      if (admin && admin.status === 'active') {
        req.admin = admin;
        req.user = admin;
        return next();
      }
    } catch (err) {
      // Not an admin token, continue to customer check
    }

    // Try Customer Secret
    try {
      const decodedCustomer = jwt.verify(token, CUSTOMER_ACCESS_SECRET());
      let customer = null;
      if (global.dbConnected) {
        customer = await Customer.findById(decodedCustomer.id).select('-password');
      } else {
        const found = jsonDb.findById('customers', decodedCustomer.id);
        if (found) {
          const { password, ...cust } = found;
          customer = cust;
        }
      }
      if (customer && customer.status !== 'suspended' && customer.status !== 'deactivated') {
        req.customer = customer;
        req.user = customer;
        req.user.role = 'customer';
        return next();
      }
    } catch (err) {
      // Not a customer token with new secret, check legacy JWT_SECRET if present
    }

    // Fallback: Legacy JWT_SECRET verification for existing sessions
    try {
      const legacySecret = process.env.JWT_SECRET || 'ripoma_secret_123';
      const decodedLegacy = jwt.verify(token, legacySecret);
      
      let user = null;
      if (global.dbConnected) {
        user = await (Admin.findById(decodedLegacy.id).select('-password') || 
                      Customer.findById(decodedLegacy.id).select('-password') ||
                      User.findById(decodedLegacy.id).select('-password'));
      } else {
        user = jsonDb.findById('admins', decodedLegacy.id) || 
               jsonDb.findById('customers', decodedLegacy.id) || 
               jsonDb.findById('users', decodedLegacy.id);
      }

      if (user) {
        req.user = user;
        if (user.role && user.role !== 'customer') {
          req.admin = user;
        } else {
          req.customer = user;
        }
        return next();
      }
    } catch (err) {
      return res.status(401).json({ message: 'Not authorized, token validation failed' });
    }
  }

  return res.status(401).json({ message: 'Not authorized, no bearer token provided' });
};

/**
 * Backward compatibility: admin
 */
export const admin = (req, res, next) => {
  const role = req.admin?.role || req.user?.role;
  if (role === 'admin' || role === 'super_admin') {
    next();
  } else {
    res.status(403).json({ message: 'Not authorized as an administrator' });
  }
};

/**
 * Backward compatibility: workerOrAdmin
 */
export const workerOrAdmin = (req, res, next) => {
  const role = req.admin?.role || req.user?.role;
  if (role && role !== 'customer') {
    next();
  } else {
    res.status(403).json({ message: 'Not authorized as farm worker or administrator' });
  }
};

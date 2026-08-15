import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import Customer from '../models/Customer.js';
import { jsonDb } from '../utils/jsonDb.js';

const CUSTOMER_ACCESS_SECRET = () => process.env.CUSTOMER_JWT_ACCESS_SECRET || 'ripoma_customer_jwt_access_secret_2026_dev';
const CUSTOMER_REFRESH_SECRET = () => process.env.CUSTOMER_JWT_REFRESH_SECRET || 'ripoma_customer_jwt_refresh_secret_2026_dev';

/**
 * Generate Customer Access Token (15 minutes)
 */
export const generateCustomerAccessToken = (customerId) => {
  return jwt.sign(
    { id: customerId, role: 'customer' },
    CUSTOMER_ACCESS_SECRET(),
    { expiresIn: '15m' }
  );
};

/**
 * Generate Customer Refresh Token (7 days)
 */
export const generateCustomerRefreshToken = (customerId) => {
  return jwt.sign(
    { id: customerId, role: 'customer', type: 'refresh' },
    CUSTOMER_REFRESH_SECRET(),
    { expiresIn: '7d' }
  );
};

/**
 * @desc    Register a new storefront customer
 * @route   POST /api/v1/auth/customer/register
 * @access  Public
 */
export const registerCustomer = async (req, res) => {
  const { name, email, password, phone, address } = req.body;

  try {
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email, and password are required' });
    }

    // Enforce Customer Password Policy: Min 8 characters
    if (password.length < 8) {
      return res.status(400).json({ message: 'Customer password must be at least 8 characters long' });
    }

    const cleanEmail = email.toLowerCase().trim();

    // Check existing customer in customers table
    let existing = null;
    if (global.dbConnected) {
      existing = await Customer.findOne({ email: cleanEmail });
    } else {
      existing = jsonDb.findOne('customers', c => c.email?.toLowerCase() === cleanEmail);
    }

    if (existing) {
      return res.status(400).json({ message: 'A customer account with this email already exists' });
    }

    const defaultAddress = address ? [{
      street: address.street || '',
      city: address.city || '',
      state: address.state || '',
      zipCode: address.zipCode || '',
      country: address.country || '',
      isDefault: true
    }] : [];

    let newCustomer = null;

    if (global.dbConnected) {
      newCustomer = await Customer.create({
        name: name.trim(),
        email: cleanEmail,
        password, // Pre-save hook hashes with bcrypt
        phone: phone || '',
        addresses: defaultAddress,
        loyalty_points: 0,
        wishlist: [],
        status: 'active'
      });
    } else {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      newCustomer = jsonDb.create('customers', {
        name: name.trim(),
        email: cleanEmail,
        password: hashedPassword,
        phone: phone || '',
        addresses: defaultAddress,
        loyalty_points: 0,
        wishlist: [],
        status: 'active',
        failedLoginAttempts: 0,
        lockoutUntil: null,
        loginHistory: []
      });
    }

    const token = generateCustomerAccessToken(newCustomer._id);
    const refreshToken = generateCustomerRefreshToken(newCustomer._id);

    return res.status(201).json({
      _id: newCustomer._id,
      name: newCustomer.name,
      email: newCustomer.email,
      role: 'customer',
      phone: newCustomer.phone || '',
      addresses: newCustomer.addresses || [],
      loyalty_points: newCustomer.loyalty_points || 0,
      token,
      refreshToken
    });
  } catch (error) {
    return res.status(500).json({ message: `Customer registration failed: ${error.message}` });
  }
};

/**
 * @desc    Customer login & issue tokens
 * @route   POST /api/v1/auth/customer/login
 * @access  Public
 */
export const loginCustomer = async (req, res) => {
  const { email, password } = req.body;

  try {
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const cleanEmail = email.toLowerCase().trim();
    let customer = null;

    if (global.dbConnected) {
      customer = await Customer.findOne({ email: cleanEmail });
    } else {
      customer = jsonDb.findOne('customers', c => c.email?.toLowerCase() === cleanEmail);
    }

    if (!customer) {
      return res.status(401).json({ message: 'Invalid customer email or password' });
    }

    // Check account status
    if (customer.status === 'suspended' || customer.status === 'deactivated') {
      return res.status(403).json({ message: 'This customer account is deactivated. Please contact support.' });
    }

    // Check Account Lockout (5 attempts / 15 minutes lockout)
    if (customer.lockoutUntil && new Date(customer.lockoutUntil) > new Date()) {
      const remainingMin = Math.ceil((new Date(customer.lockoutUntil) - Date.now()) / 60000);
      return res.status(423).json({ 
        message: `Account locked out due to multiple failed login attempts. Please try again in ${remainingMin} minutes.` 
      });
    }

    // Verify Password
    let isMatch = false;
    if (global.dbConnected) {
      isMatch = await customer.matchPassword(password);
    } else {
      isMatch = await bcrypt.compare(password, customer.password);
    }

    if (!isMatch) {
      const attempts = (customer.failedLoginAttempts || 0) + 1;
      let lockoutDate = null;

      if (attempts >= 5) {
        lockoutDate = new Date(Date.now() + 15 * 60 * 1000);
      }

      if (global.dbConnected) {
        customer.failedLoginAttempts = attempts;
        customer.lockoutUntil = lockoutDate;
        await customer.save();
      } else {
        jsonDb.findByIdAndUpdate('customers', customer._id, {
          failedLoginAttempts: attempts,
          lockoutUntil: lockoutDate ? lockoutDate.toISOString() : null
        });
      }

      if (attempts >= 5) {
        return res.status(423).json({
          message: 'Too many failed login attempts. Customer account is locked out for 15 minutes.'
        });
      }

      return res.status(401).json({ 
        message: `Invalid customer email or password. Attempt ${attempts} of 5 before temporary lockout.` 
      });
    }

    // Successful login: Reset lockout & record login history
    const ipAddress = req.ip || req.connection?.remoteAddress || '';
    const userAgent = req.headers['user-agent'] || '';
    const logEntry = { timestamp: new Date(), ipAddress, userAgent };

    if (global.dbConnected) {
      customer.failedLoginAttempts = 0;
      customer.lockoutUntil = null;
      customer.loginHistory = customer.loginHistory || [];
      customer.loginHistory.push(logEntry);
      await customer.save();
    } else {
      const history = customer.loginHistory || [];
      jsonDb.findByIdAndUpdate('customers', customer._id, {
        failedLoginAttempts: 0,
        lockoutUntil: null,
        loginHistory: [...history, { _id: Math.random().toString(36).substring(2, 11), ...logEntry }]
      });
    }

    const token = generateCustomerAccessToken(customer._id);
    const refreshToken = generateCustomerRefreshToken(customer._id);

    return res.json({
      _id: customer._id,
      name: customer.name,
      email: customer.email,
      role: 'customer',
      phone: customer.phone || '',
      addresses: customer.addresses || [],
      loyalty_points: customer.loyalty_points || 0,
      token,
      refreshToken
    });
  } catch (error) {
    return res.status(500).json({ message: `Customer login failed: ${error.message}` });
  }
};

/**
 * @desc    Refresh customer access token
 * @route   POST /api/v1/auth/customer/refresh
 * @access  Public (Requires valid Customer Refresh Token)
 */
export const refreshCustomerToken = async (req, res) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    return res.status(400).json({ message: 'Refresh token is required' });
  }

  try {
    const decoded = jwt.verify(refreshToken, CUSTOMER_REFRESH_SECRET());

    if (decoded.role !== 'customer' || decoded.type !== 'refresh') {
      return res.status(403).json({ message: 'Invalid customer refresh token identity' });
    }

    let customer = null;
    if (global.dbConnected) {
      customer = await Customer.findById(decoded.id);
    } else {
      customer = jsonDb.findById('customers', decoded.id);
    }

    if (!customer || customer.status === 'suspended' || customer.status === 'deactivated') {
      return res.status(403).json({ message: 'Customer account inactive or not found' });
    }

    const newAccessToken = generateCustomerAccessToken(customer._id);
    return res.json({ token: newAccessToken });
  } catch (error) {
    return res.status(401).json({ message: 'Invalid or expired customer refresh token' });
  }
};

/**
 * @desc    Get customer profile & wishlist
 * @route   GET /api/v1/auth/customer/profile
 * @access  Private (Customer)
 */
export const getCustomerProfile = async (req, res) => {
  try {
    let customer = null;
    const customerId = req.customer?._id || req.user?._id;

    if (global.dbConnected) {
      customer = await Customer.findById(customerId).select('-password').populate('wishlist');
    } else {
      customer = jsonDb.findById('customers', customerId);
      if (customer) {
        const { password, ...custNoPass } = customer;
        const listIds = custNoPass.wishlist || [];
        const populatedList = listIds.map(id => jsonDb.findById('products', id)).filter(Boolean);
        customer = { ...custNoPass, wishlist: populatedList };
      }
    }

    if (!customer) {
      return res.status(404).json({ message: 'Customer profile not found' });
    }

    return res.json(customer);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

/**
 * @desc    Update customer profile / address
 * @route   PUT /api/v1/auth/customer/profile
 * @access  Private (Customer)
 */
export const updateCustomerProfile = async (req, res) => {
  const { name, phone, address, addresses } = req.body;
  const customerId = req.customer?._id || req.user?._id;

  try {
    if (global.dbConnected) {
      const customer = await Customer.findById(customerId);
      if (!customer) {
        return res.status(404).json({ message: 'Customer not found' });
      }

      if (name) customer.name = name.trim();
      if (phone !== undefined) customer.phone = phone;

      if (addresses && Array.isArray(addresses)) {
        customer.addresses = addresses;
      } else if (address) {
        if (!customer.addresses || customer.addresses.length === 0) {
          customer.addresses = [{ ...address, isDefault: true }];
        } else {
          customer.addresses[0] = { ...customer.addresses[0], ...address };
        }
      }

      const updated = await customer.save();
      return res.json({
        _id: updated._id,
        name: updated.name,
        email: updated.email,
        role: 'customer',
        phone: updated.phone,
        addresses: updated.addresses,
        loyalty_points: updated.loyalty_points
      });
    } else {
      const customer = jsonDb.findById('customers', customerId);
      if (!customer) {
        return res.status(404).json({ message: 'Customer not found' });
      }

      let updatedAddresses = customer.addresses || [];
      if (addresses && Array.isArray(addresses)) {
        updatedAddresses = addresses;
      } else if (address) {
        if (updatedAddresses.length === 0) {
          updatedAddresses = [{ _id: 'addr_1', ...address, isDefault: true }];
        } else {
          updatedAddresses[0] = { ...updatedAddresses[0], ...address };
        }
      }

      const updated = jsonDb.findByIdAndUpdate('customers', customerId, {
        name: name ? name.trim() : customer.name,
        phone: phone !== undefined ? phone : customer.phone,
        addresses: updatedAddresses
      });

      return res.json({
        _id: updated._id,
        name: updated.name,
        email: updated.email,
        role: 'customer',
        phone: updated.phone,
        addresses: updated.addresses,
        loyalty_points: updated.loyalty_points
      });
    }
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

/**
 * @desc    Toggle item in customer wishlist
 * @route   POST /api/v1/auth/customer/wishlist
 * @access  Private (Customer)
 */
export const toggleCustomerWishlist = async (req, res) => {
  const { productId } = req.body;
  const customerId = req.customer?._id || req.user?._id;

  if (!productId) {
    return res.status(400).json({ message: 'Product ID is required' });
  }

  try {
    if (global.dbConnected) {
      const customer = await Customer.findById(customerId);
      if (!customer) return res.status(404).json({ message: 'Customer not found' });

      customer.wishlist = customer.wishlist || [];
      const idx = customer.wishlist.indexOf(productId);
      if (idx === -1) {
        customer.wishlist.push(productId);
      } else {
        customer.wishlist.splice(idx, 1);
      }
      await customer.save();
      return res.json({ message: 'Wishlist updated', wishlist: customer.wishlist });
    } else {
      const customer = jsonDb.findById('customers', customerId);
      if (!customer) return res.status(404).json({ message: 'Customer not found' });

      const list = customer.wishlist || [];
      const idx = list.indexOf(productId);
      let updatedList = [...list];
      if (idx === -1) {
        updatedList.push(productId);
      } else {
        updatedList.splice(idx, 1);
      }
      const updated = jsonDb.findByIdAndUpdate('customers', customerId, { wishlist: updatedList });
      return res.json({ message: 'Wishlist updated', wishlist: updated.wishlist });
    }
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

/**
 * @desc    Storefront Google OAuth Sign-in for Customers
 * @route   POST /api/v1/auth/customer/google
 * @access  Public
 */
export const googleCustomerLogin = async (req, res) => {
  const { credential } = req.body;

  if (!credential) {
    return res.status(400).json({ message: 'Google credential token is required' });
  }

  try {
    const decoded = jwt.decode(credential);
    if (!decoded || !decoded.email) {
      return res.status(400).json({ message: 'Invalid Google credential token' });
    }

    const { email, name } = decoded;
    const cleanEmail = email.toLowerCase().trim();

    let customer = null;
    if (global.dbConnected) {
      customer = await Customer.findOne({ email: cleanEmail });
    } else {
      customer = jsonDb.findOne('customers', c => c.email?.toLowerCase() === cleanEmail);
    }

    if (!customer) {
      // Create new customer account via Google OAuth
      const randomPassword = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);

      if (global.dbConnected) {
        customer = await Customer.create({
          name: name || 'Google Customer',
          email: cleanEmail,
          password: randomPassword,
          phone: '',
          addresses: [],
          loyalty_points: 0,
          wishlist: [],
          status: 'active'
        });
      } else {
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(randomPassword, salt);
        customer = jsonDb.create('customers', {
          name: name || 'Google Customer',
          email: cleanEmail,
          password: hashedPassword,
          phone: '',
          addresses: [],
          loyalty_points: 0,
          wishlist: [],
          status: 'active',
          failedLoginAttempts: 0,
          lockoutUntil: null,
          loginHistory: []
        });
      }
    }

    // Log history
    const ipAddress = req.ip || req.connection?.remoteAddress || '';
    const userAgent = req.headers['user-agent'] || '';
    const logEntry = { timestamp: new Date(), ipAddress, userAgent };

    if (global.dbConnected) {
      customer.loginHistory = customer.loginHistory || [];
      customer.loginHistory.push(logEntry);
      await customer.save();
    } else {
      const hist = customer.loginHistory || [];
      jsonDb.findByIdAndUpdate('customers', customer._id, {
        loginHistory: [...hist, { _id: Math.random().toString(36).substring(2, 11), ...logEntry }]
      });
    }

    const token = generateCustomerAccessToken(customer._id);
    const refreshToken = generateCustomerRefreshToken(customer._id);

    return res.json({
      _id: customer._id,
      name: customer.name,
      email: customer.email,
      role: 'customer',
      phone: customer.phone || '',
      addresses: customer.addresses || [],
      loyalty_points: customer.loyalty_points || 0,
      token,
      refreshToken
    });
  } catch (error) {
    return res.status(500).json({ message: `Google customer login failed: ${error.message}` });
  }
};

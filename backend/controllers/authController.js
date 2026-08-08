import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import { jsonDb } from '../utils/jsonDb.js';

// Helper to generate JWT Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'ripoma_secret_123', {
    expiresIn: '30d',
  });
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
export const registerUser = async (req, res) => {
  const { name, email, password, role } = req.body;

  try {
    let existingUser = null;

    if (global.dbConnected) {
      existingUser = await User.findOne({ email });
    } else {
      existingUser = jsonDb.findOne('users', u => u.email === email);
    }

    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Default first user as Admin, otherwise Role
    const userRole = role || 'customer';

    if (global.dbConnected) {
      const user = await User.create({
        name,
        email,
        password, // Hashed by User model hook
        role: userRole,
      });

      res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        token: generateToken(user._id),
      });
    } else {
      // JSON DB doesn't have Pre-save hooks, so hash password manually
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      const newUser = jsonDb.create('users', {
        name,
        email,
        password: hashedPassword,
        role: userRole,
        phone: '',
        address: { street: '', city: '', state: '', zipCode: '', country: '' }
      });

      res.status(201).json({
        _id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        token: generateToken(newUser._id),
      });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Auth user & get token
// @route   POST /api/auth/login
// @access  Public
export const authUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    let user = null;

    if (global.dbConnected) {
      user = await User.findOne({ email });
    } else {
      user = jsonDb.findOne('users', u => u.email === email);
    }

    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Match Password
    let isMatch = false;
    if (global.dbConnected) {
      isMatch = await user.matchPassword(password);
    } else {
      isMatch = await bcrypt.compare(password, user.password);
    }

    if (isMatch) {
      const ipAddress = req.ip || req.connection.remoteAddress || '';
      const userAgent = req.headers['user-agent'] || '';
      const historyLog = { timestamp: new Date(), ipAddress, userAgent };

      if (global.dbConnected) {
        user.loginHistory = user.loginHistory || [];
        user.loginHistory.push(historyLog);
        await user.save();
      } else {
        const currentHistory = user.loginHistory || [];
        jsonDb.findByIdAndUpdate('users', user._id, {
          loginHistory: [...currentHistory, { _id: Math.random().toString(36).substring(2, 11), ...historyLog }]
        });
      }

      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone || '',
        address: user.address || {},
        token: generateToken(user._id),
      });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get user profile
// @route   GET /api/auth/profile
// @access  Private
export const getUserProfile = async (req, res) => {
  try {
    let user = null;
    if (global.dbConnected) {
      user = await User.findById(req.user._id).select('-password').populate('wishlist');
    } else {
      user = jsonDb.findById('users', req.user._id);
      if (user) {
        const listIds = user.wishlist || [];
        const populatedList = listIds.map(id => jsonDb.findById('products', id)).filter(Boolean);
        user = { ...user, wishlist: populatedList };
      }
    }

    if (user) {
      res.json(user);
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update user profile / address
// @route   PUT /api/auth/profile
// @access  Private
export const updateUserProfile = async (req, res) => {
  const { name, phone, address } = req.body;

  try {
    if (global.dbConnected) {
      const user = await User.findById(req.user._id);

      if (user) {
        user.name = name || user.name;
        user.phone = phone !== undefined ? phone : user.phone;
        if (address) {
          user.address = {
            street: address.street !== undefined ? address.street : user.address.street,
            city: address.city !== undefined ? address.city : user.address.city,
            state: address.state !== undefined ? address.state : user.address.state,
            zipCode: address.zipCode !== undefined ? address.zipCode : user.address.zipCode,
            country: address.country !== undefined ? address.country : user.address.country,
          };
        }

        const updatedUser = await user.save();
        res.json({
          _id: updatedUser._id,
          name: updatedUser.name,
          email: updatedUser.email,
          role: updatedUser.role,
          phone: updatedUser.phone,
          address: updatedUser.address,
        });
      } else {
        res.status(404).json({ message: 'User not found' });
      }
    } else {
      const user = jsonDb.findById('users', req.user._id);
      if (user) {
        const updatedAddress = address ? {
          street: address.street !== undefined ? address.street : user.address.street,
          city: address.city !== undefined ? address.city : user.address.city,
          state: address.state !== undefined ? address.state : user.address.state,
          zipCode: address.zipCode !== undefined ? address.zipCode : user.address.zipCode,
          country: address.country !== undefined ? address.country : user.address.country,
        } : user.address;

        const updatedUser = jsonDb.findByIdAndUpdate('users', req.user._id, {
          name: name || user.name,
          phone: phone !== undefined ? phone : user.phone,
          address: updatedAddress
        });

        res.json({
          _id: updatedUser._id,
          name: updatedUser.name,
          email: updatedUser.email,
          role: updatedUser.role,
          phone: updatedUser.phone,
          address: updatedUser.address,
        });
      } else {
        res.status(404).json({ message: 'User not found' });
      }
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Google OAuth Login
// @route   POST /api/auth/google
// @access  Public
export const googleLogin = async (req, res) => {
  const { credential } = req.body;

  if (!credential) {
    return res.status(400).json({ message: 'Google Credential Token is required' });
  }

  try {
    // Decode the token payload
    const decoded = jwt.decode(credential);
    if (!decoded) {
      return res.status(400).json({ message: 'Invalid token payload' });
    }

    const { email, name, picture } = decoded;

    // Check if user exists in database
    let user = null;
    if (global.dbConnected) {
      user = await User.findOne({ email });
    } else {
      user = jsonDb.findOne('users', u => u.email === email);
    }

    // Determine role (check if matches admin email)
    const adminEmail = process.env.GOOGLE_ADMIN_EMAIL || 'admin@ripomafarm.com';
    const isGoogleAdmin = email.toLowerCase() === adminEmail.toLowerCase();
    const assignedRole = isGoogleAdmin ? 'admin' : 'customer';

    if (!user) {
      // Create new user if not found
      // For Google login, we generate a random password
      const randomPassword = Math.random().toString(36).substring(2, 11);
      
      if (global.dbConnected) {
        user = await User.create({
          name,
          email,
          password: randomPassword,
          role: assignedRole,
          phone: '',
          address: { street: '', city: '', state: '', zipCode: '', country: '' }
        });
      } else {
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(randomPassword, salt);
        user = jsonDb.create('users', {
          name,
          email,
          password: hashedPassword,
          role: assignedRole,
          phone: '',
          address: { street: '', city: '', state: '', zipCode: '', country: '' }
        });
      }
    } else {
      // User exists. If their email matches the GOOGLE_ADMIN_EMAIL, update their role to admin
      if (isGoogleAdmin && user.role !== 'admin') {
        if (global.dbConnected) {
          user.role = 'admin';
          await user.save();
        } else {
          user = jsonDb.findByIdAndUpdate('users', user._id, { role: 'admin' });
        }
      }
    }

    // Record Login History
    const ipAddress = req.ip || req.connection.remoteAddress || '';
    const userAgent = req.headers['user-agent'] || '';
    const historyLog = { timestamp: new Date(), ipAddress, userAgent };

    if (global.dbConnected) {
      user.loginHistory = user.loginHistory || [];
      user.loginHistory.push(historyLog);
      await user.save();
    } else {
      const currentHistory = user.loginHistory || [];
      jsonDb.findByIdAndUpdate('users', user._id, {
        loginHistory: [...currentHistory, { _id: Math.random().toString(36).substring(2, 11), ...historyLog }]
      });
    }

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      phone: user.phone || '',
      address: user.address || {},
      token: generateToken(user._id),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Toggle product in customer wishlist
// @route   POST /api/auth/wishlist
// @access  Private
export const toggleWishlist = async (req, res) => {
  const { productId } = req.body;
  const userId = req.user._id;

  try {
    let user = null;
    if (global.dbConnected) {
      user = await User.findById(userId);
      if (user) {
        user.wishlist = user.wishlist || [];
        const index = user.wishlist.indexOf(productId);
        if (index === -1) {
          user.wishlist.push(productId);
        } else {
          user.wishlist.splice(index, 1);
        }
        await user.save();
        res.json({ message: 'Wishlist updated', wishlist: user.wishlist });
      } else {
        res.status(404).json({ message: 'User not found' });
      }
    } else {
      user = jsonDb.findById('users', userId);
      if (user) {
        const list = user.wishlist || [];
        const index = list.indexOf(productId);
        let newList = [...list];
        if (index === -1) {
          newList.push(productId);
        } else {
          newList.splice(index, 1);
        }
        const updatedUser = jsonDb.findByIdAndUpdate('users', userId, { wishlist: newList });
        res.json({ message: 'Wishlist updated', wishlist: updatedUser.wishlist });
      } else {
        res.status(404).json({ message: 'User not found' });
      }
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

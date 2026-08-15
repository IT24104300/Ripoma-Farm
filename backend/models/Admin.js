import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

export const ADMIN_ROLES = [
  'super_admin',
  'admin',
  'farmhand',
  'fisher',
  'packer',
  'order_manager',
  'supervisor'
];

export const DEFAULT_ROLE_PERMISSIONS = {
  super_admin: [
    'all',
    'manage_admins',
    'manage_workers',
    'manage_roles',
    'manage_inventory',
    'manage_products',
    'manage_orders',
    'manage_customers',
    'manage_settings',
    'view_financials',
    'manage_financials',
    'audit_logs'
  ],
  admin: [
    'manage_workers',
    'manage_inventory',
    'manage_products',
    'manage_orders',
    'manage_customers',
    'manage_settings',
    'view_financials'
  ],
  order_manager: [
    'manage_orders',
    'manage_customers',
    'view_inventory'
  ],
  supervisor: [
    'manage_workers',
    'manage_inventory',
    'manage_orders'
  ],
  farmhand: [
    'view_tasks',
    'update_tasks',
    'view_inventory'
  ],
  fisher: [
    'view_tasks',
    'update_tasks',
    'view_inventory'
  ],
  packer: [
    'view_tasks',
    'update_tasks',
    'manage_orders'
  ]
};

const AdminSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  password: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    enum: ADMIN_ROLES,
    default: 'admin',
  },
  permissions: [{
    type: String,
  }],
  two_factor_enabled: {
    type: Boolean,
    default: true,
  },
  two_factor_secret: {
    type: String,
    default: 'RIPOMA-SECURE-2FA-FARM',
  },
  status: {
    type: String,
    enum: ['active', 'suspended', 'inactive'],
    default: 'active',
  },
  phone: {
    type: String,
    default: '',
    trim: true,
  },
  failedLoginAttempts: {
    type: Number,
    default: 0,
  },
  lockoutUntil: {
    type: Date,
    default: null,
  },
  loginHistory: [{
    timestamp: { type: Date, default: Date.now },
    ipAddress: { type: String, default: '' },
    userAgent: { type: String, default: '' }
  }],
}, {
  timestamps: true,
});

// Auto-assign default permissions based on role if none provided
AdminSchema.pre('validate', function(next) {
  if (!this.permissions || this.permissions.length === 0) {
    this.permissions = DEFAULT_ROLE_PERMISSIONS[this.role] || DEFAULT_ROLE_PERMISSIONS.admin;
  }
  next();
});

// Hash password before saving
AdminSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    return next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compare password method
AdminSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

const Admin = mongoose.models.Admin || mongoose.model('Admin', AdminSchema);
export default Admin;

import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const CustomerAddressSchema = new mongoose.Schema({
  street: { type: String, default: '' },
  city: { type: String, default: '' },
  state: { type: String, default: '' },
  zipCode: { type: String, default: '' },
  country: { type: String, default: '' },
  isDefault: { type: Boolean, default: false }
}, { _id: true });

const CustomerSchema = new mongoose.Schema({
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
  phone: {
    type: String,
    default: '',
    trim: true,
  },
  addresses: [CustomerAddressSchema],
  loyalty_points: {
    type: Number,
    default: 0,
    min: 0,
  },
  wishlist: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product'
  }],
  status: {
    type: String,
    enum: ['active', 'suspended', 'deactivated'],
    default: 'active',
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

// Hash password before saving
CustomerSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    return next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compare password method
CustomerSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

const Customer = mongoose.models.Customer || mongoose.model('Customer', CustomerSchema);
export default Customer;

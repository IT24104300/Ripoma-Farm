import mongoose from 'mongoose';

const NotificationSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  message: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    enum: ['info', 'warning', 'success', 'error'],
    default: 'info',
  },
  roleRecipient: {
    type: String,
    enum: ['admin', 'worker', 'customer', 'all'],
    default: 'admin',
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false, // if null, applies to all users of that role
  },
  read: {
    type: Boolean,
    default: false,
  },
}, {
  timestamps: true,
});

const Notification = mongoose.models.Notification || mongoose.model('Notification', NotificationSchema);
export default Notification;

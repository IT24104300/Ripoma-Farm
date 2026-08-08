import mongoose from 'mongoose';

const AuditLogSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  userName: {
    type: String,
    required: true,
  },
  action: {
    type: String,
    required: true, // e.g. 'update_product', 'change_order_status', 'add_worker'
  },
  description: {
    type: String,
    required: true,
  },
  ipAddress: {
    type: String,
    default: '',
  },
}, {
  timestamps: true,
});

const AuditLog = mongoose.models.AuditLog || mongoose.model('AuditLog', AuditLogSchema);
export default AuditLog;

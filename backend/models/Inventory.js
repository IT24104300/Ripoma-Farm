import mongoose from 'mongoose';

const InventoryLogSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true,
  },
  productName: {
    type: String,
    required: true,
  },
  variantName: {
    type: String,
    default: '',
  },
  changeType: {
    type: String,
    enum: ['restock', 'sale', 'adjustment', 'return', 'loss'],
    required: true,
  },
  quantityChanged: {
    type: Number,
    required: true, // positive for additions, negative for sales/losses
  },
  stockAfterChange: {
    type: Number,
    required: true,
  },
  description: {
    type: String,
    default: '',
  },
  performedBy: {
    type: String, // name or ID of the admin/worker who made the change
    required: true,
  },
}, {
  timestamps: true,
});

const InventoryLog = mongoose.models.InventoryLog || mongoose.model('InventoryLog', InventoryLogSchema);
export default InventoryLog;

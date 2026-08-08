import mongoose from 'mongoose';

const TransactionSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['income', 'expense'],
    required: true,
  },
  amount: {
    type: Number,
    required: true,
  },
  costOfGoods: {
    type: Number,
    default: 0, // For income transactions, this is the cost of items sold (for profit calculation)
  },
  category: {
    type: String,
    required: true, // 'sales', 'salary', 'inventory_purchase', 'shipping', 'other_expense'
  },
  description: {
    type: String,
    required: true,
  },
  referenceId: {
    type: String, // Can link to orderId, workerId, etc.
    default: '',
  },
  date: {
    type: Date,
    default: Date.now,
  },
}, {
  timestamps: true,
});

const Transaction = mongoose.models.Transaction || mongoose.model('Transaction', TransactionSchema);
export default Transaction;

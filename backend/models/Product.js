import mongoose from 'mongoose';

const ProductSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  category: {
    type: String,
    required: true, // 'Dry Fish', 'Eggs', 'Chicken'
  },
  subcategory: {
    type: String,
    default: '',
  },
  images: {
    type: [String],
    required: true,
  },
  basePrice: {
    type: Number,
    required: true,
  },
  costPrice: {
    type: Number,
    required: true, // For profit calculation
  },
  discount: {
    type: Number,
    default: 0, // In percentage (e.g. 10 for 10% off)
  },
  stock: {
    type: Number,
    required: true,
    default: 0,
  },
  sku: {
    type: String,
    unique: true,
  },
  variants: [{
    name: String, // e.g. "100g", "Tray of 30", "Whole Chicken (1.5kg)"
    price: Number,
    costPrice: Number,
    stock: Number,
    sku: String,
  }],
  specifications: {
    type: Map,
    of: String, // e.g., Size: "Large", Packaging: "Vaccum Packed", Nutrition: "High Protein"
  },
  rating: {
    type: Number,
    default: 5,
  },
  reviews: [{
    userName: String,
    rating: Number,
    comment: String,
    createdAt: {
      type: Date,
      default: Date.now,
    }
  }],
  isDeleted: {
    type: Boolean,
    default: false,
  },
}, {
  timestamps: true,
});

const Product = mongoose.models.Product || mongoose.model('Product', ProductSchema);
export default Product;

import mongoose from 'mongoose';

const CategorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true, // Dry Fish, Eggs, Chicken
  },
  description: {
    type: String,
    default: '',
  },
  subcategories: {
    type: [String],
    default: [],
  },
}, {
  timestamps: true,
});

const Category = mongoose.models.Category || mongoose.model('Category', CategorySchema);
export default Category;

import Product from '../models/Product.js';
import Category from '../models/Category.js';
import { jsonDb } from '../utils/jsonDb.js';

// @desc    Get all products (with filtering, sorting, searching)
// @route   GET /api/products
// @access  Public
export const getProducts = async (req, res) => {
  const { category, search, sort } = req.query;

  try {
    let products = [];

    if (global.dbConnected) {
      // MongoDB Query
      let query = { isDeleted: { $ne: true } };
      if (category) query.category = category;
      if (search) {
        query.name = { $regex: search, $options: 'i' };
      }

      let apiQuery = Product.find(query);

      // Sorting
      if (sort === 'price_asc') {
        apiQuery = apiQuery.sort({ basePrice: 1 });
      } else if (sort === 'price_desc') {
        apiQuery = apiQuery.sort({ basePrice: -1 });
      } else if (sort === 'newest') {
        apiQuery = apiQuery.sort({ createdAt: -1 });
      } else if (sort === 'popular') {
        apiQuery = apiQuery.sort({ rating: -1 });
      }

      products = await apiQuery;
    } else {
      // JSON DB Query
      products = jsonDb.find('products', (p) => {
        if (p.isDeleted) return false;
        let match = true;
        if (category && p.category !== category) match = false;
        if (search && !p.name.toLowerCase().includes(search.toLowerCase())) match = false;
        return match;
      });

      // Sorting
      if (sort === 'price_asc') {
        products.sort((a, b) => a.basePrice - b.basePrice);
      } else if (sort === 'price_desc') {
        products.sort((a, b) => b.basePrice - a.basePrice);
      } else if (sort === 'newest') {
        products.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      } else if (sort === 'popular') {
        products.sort((a, b) => (b.rating || 0) - (a.rating || 0));
      }
    }

    res.json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get product by ID
// @route   GET /api/products/:id
// @access  Public
export const getProductById = async (req, res) => {
  const { id } = req.params;

  try {
    let product = null;

    if (global.dbConnected) {
      product = await Product.findById(id);
    } else {
      product = jsonDb.findById('products', id);
    }

    if (product) {
      res.json(product);
    } else {
      res.status(404).json({ message: 'Product not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create a product
// @route   POST /api/products
// @access  Private/Admin
export const createProduct = async (req, res) => {
  const { name, description, category, subcategory, images, basePrice, costPrice, discount, stock, variants, specifications } = req.body;

  try {
    const sku = `RIP-${category.substring(0, 3).toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`;

    if (global.dbConnected) {
      const product = new Product({
        name,
        description,
        category,
        subcategory: subcategory || '',
        images: images || ['https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?w=500'],
        basePrice,
        costPrice,
        discount: discount || 0,
        stock: stock || 0,
        sku,
        variants: variants || [],
        specifications: specifications || {},
      });

      const createdProduct = await product.save();
      res.status(201).json(createdProduct);
    } else {
      const newProduct = jsonDb.create('products', {
        name,
        description,
        category,
        subcategory: subcategory || '',
        images: images || ['https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?w=500'],
        basePrice: Number(basePrice),
        costPrice: Number(costPrice),
        discount: Number(discount || 0),
        stock: Number(stock || 0),
        sku,
        variants: variants || [],
        specifications: specifications || {},
        rating: 5,
        reviews: [],
      });
      res.status(201).json(newProduct);
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update a product
// @route   PUT /api/products/:id
// @access  Private/Admin
export const updateProduct = async (req, res) => {
  const { id } = req.params;
  const { name, description, category, subcategory, images, basePrice, costPrice, discount, stock, variants, specifications } = req.body;

  try {
    if (global.dbConnected) {
      const product = await Product.findById(id);

      if (product) {
        product.name = name || product.name;
        product.description = description || product.description;
        product.category = category || product.category;
        product.subcategory = subcategory !== undefined ? subcategory : product.subcategory;
        product.images = images || product.images;
        product.basePrice = basePrice !== undefined ? basePrice : product.basePrice;
        product.costPrice = costPrice !== undefined ? costPrice : product.costPrice;
        product.discount = discount !== undefined ? discount : product.discount;
        product.stock = stock !== undefined ? stock : product.stock;
        product.variants = variants || product.variants;
        product.specifications = specifications || product.specifications;

        const updatedProduct = await product.save();
        res.json(updatedProduct);
      } else {
        res.status(404).json({ message: 'Product not found' });
      }
    } else {
      const product = jsonDb.findById('products', id);
      if (product) {
        const updatedProduct = jsonDb.findByIdAndUpdate('products', id, {
          name: name || product.name,
          description: description || product.description,
          category: category || product.category,
          subcategory: subcategory !== undefined ? subcategory : product.subcategory,
          images: images || product.images,
          basePrice: basePrice !== undefined ? Number(basePrice) : product.basePrice,
          costPrice: costPrice !== undefined ? Number(costPrice) : product.costPrice,
          discount: discount !== undefined ? Number(discount) : product.discount,
          stock: stock !== undefined ? Number(stock) : product.stock,
          variants: variants || product.variants,
          specifications: specifications || product.specifications,
        });
        res.json(updatedProduct);
      } else {
        res.status(404).json({ message: 'Product not found' });
      }
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete a product
// @route   DELETE /api/products/:id
// @access  Private/Admin
export const deleteProduct = async (req, res) => {
  const { id } = req.params;

  try {
    if (global.dbConnected) {
      const product = await Product.findById(id);

      if (product) {
        product.isDeleted = true;
        await product.save();
        res.json({ message: 'Product removed' });
      } else {
        res.status(404).json({ message: 'Product not found' });
      }
    } else {
      const product = jsonDb.findById('products', id);
      if (product) {
        jsonDb.findByIdAndUpdate('products', id, { isDeleted: true });
        res.json({ message: 'Product removed' });
      } else {
        res.status(404).json({ message: 'Product not found' });
      }
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all categories
// @route   GET /api/products/categories
// @access  Public
export const getCategories = async (req, res) => {
  try {
    let categories = [];
    if (global.dbConnected) {
      categories = await Category.find({});
    } else {
      categories = jsonDb.find('categories');
    }
    res.json(categories);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create a category
// @route   POST /api/products/categories
// @access  Private/Admin
export const createCategory = async (req, res) => {
  const { name, description, subcategories } = req.body;
  try {
    if (global.dbConnected) {
      const categoryExists = await Category.findOne({ name });
      if (categoryExists) {
        return res.status(400).json({ message: 'Category already exists' });
      }
      const category = new Category({ name, description, subcategories });
      const created = await category.save();
      res.status(201).json(created);
    } else {
      const categories = jsonDb.find('categories');
      const categoryExists = categories.find(c => c.name.toLowerCase() === name.toLowerCase());
      if (categoryExists) {
        return res.status(400).json({ message: 'Category already exists' });
      }
      const created = jsonDb.create('categories', { name, description, subcategories: subcategories || [] });
      res.status(201).json(created);
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update a category
// @route   PUT /api/products/categories/:id
// @access  Private/Admin
export const updateCategory = async (req, res) => {
  const { id } = req.params;
  const { name, description, subcategories } = req.body;
  try {
    if (global.dbConnected) {
      const category = await Category.findById(id);
      if (category) {
        category.name = name || category.name;
        category.description = description !== undefined ? description : category.description;
        category.subcategories = subcategories || category.subcategories;
        const updated = await category.save();
        res.json(updated);
      } else {
        res.status(404).json({ message: 'Category not found' });
      }
    } else {
      const category = jsonDb.findById('categories', id);
      if (category) {
        const updated = jsonDb.findByIdAndUpdate('categories', id, {
          name: name || category.name,
          description: description !== undefined ? description : category.description,
          subcategories: subcategories || category.subcategories
        });
        res.json(updated);
      } else {
        res.status(404).json({ message: 'Category not found' });
      }
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete a category
// @route   DELETE /api/products/categories/:id
// @access  Private/Admin
export const deleteCategory = async (req, res) => {
  const { id } = req.params;
  try {
    if (global.dbConnected) {
      const category = await Category.findById(id);
      if (category) {
        await category.deleteOne();
        res.json({ message: 'Category removed' });
      } else {
        res.status(404).json({ message: 'Category not found' });
      }
    } else {
      const category = jsonDb.findById('categories', id);
      if (category) {
        jsonDb.findByIdAndDelete('categories', id);
        res.json({ message: 'Category removed' });
      } else {
        res.status(404).json({ message: 'Category not found' });
      }
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Submit a review
// @route   POST /api/products/:id/reviews
// @access  Private
export const createProductReview = async (req, res) => {
  const { id } = req.params;
  const { rating, comment } = req.body;

  try {
    if (global.dbConnected) {
      const product = await Product.findById(id);

      if (product) {
        const review = {
          userName: req.user.name,
          rating: Number(rating),
          comment,
        };

        product.reviews.push(review);
        // Calculate average rating
        product.rating = product.reviews.reduce((acc, item) => item.rating + acc, 0) / product.reviews.length;

        await product.save();
        res.status(201).json({ message: 'Review added' });
      } else {
        res.status(404).json({ message: 'Product not found' });
      }
    } else {
      const product = jsonDb.findById('products', id);
      if (product) {
        const review = {
          userName: req.user.name,
          rating: Number(rating),
          comment,
          createdAt: new Date().toISOString()
        };

        const updatedReviews = [...(product.reviews || []), review];
        const newRating = updatedReviews.reduce((acc, item) => item.rating + acc, 0) / updatedReviews.length;

        jsonDb.findByIdAndUpdate('products', id, {
          reviews: updatedReviews,
          rating: newRating
        });
        res.status(201).json({ message: 'Review added' });
      } else {
        res.status(404).json({ message: 'Product not found' });
      }
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

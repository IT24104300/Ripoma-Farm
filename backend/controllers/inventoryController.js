import Product from '../models/Product.js';
import InventoryLog from '../models/Inventory.js';
import { jsonDb } from '../utils/jsonDb.js';

// @desc    Get all inventory logs
// @route   GET /api/inventory/logs
// @access  Private/WorkerOrAdmin
export const getInventoryLogs = async (req, res) => {
  try {
    let logs = [];
    if (global.dbConnected) {
      logs = await InventoryLog.find({}).sort({ createdAt: -1 });
    } else {
      logs = jsonDb.find('inventorylogs');
      logs.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }
    res.json(logs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Manual restock or stock adjustment
// @route   POST /api/inventory/restock
// @access  Private/WorkerOrAdmin
export const restockProduct = async (req, res) => {
  const { productId, variantName, quantityChanged, description } = req.body;

  if (!productId || quantityChanged === undefined) {
    return res.status(400).json({ message: 'Product ID and quantity change required' });
  }

  try {
    const qty = Number(quantityChanged);
    const userName = req.user.name;
    let updatedProduct = null;
    let newStock = 0;

    if (global.dbConnected) {
      const product = await Product.findById(productId);
      if (!product) {
        return res.status(404).json({ message: 'Product not found' });
      }

      if (variantName && product.variants && product.variants.length > 0) {
        const variant = product.variants.find(v => v.name === variantName);
        if (variant) {
          variant.stock = (variant.stock || 0) + qty;
          newStock = variant.stock;
        } else {
          return res.status(400).json({ message: 'Product variant not found' });
        }
        product.stock = product.variants.reduce((acc, v) => acc + (v.stock || 0), 0);
      } else {
        product.stock = (product.stock || 0) + qty;
        newStock = product.stock;
      }

      await product.save();
      updatedProduct = product;

      // Log to inventory
      await InventoryLog.create({
        productId: product._id,
        productName: product.name,
        variantName: variantName || '',
        changeType: qty > 0 ? 'restock' : 'adjustment',
        quantityChanged: qty,
        stockAfterChange: newStock,
        description: description || 'Manual stock adjustment',
        performedBy: userName,
      });
    } else {
      // JSON DB Flow
      const product = jsonDb.findById('products', productId);
      if (!product) {
        return res.status(404).json({ message: 'Product not found' });
      }

      let updatedVariants = [...(product.variants || [])];

      if (variantName && updatedVariants.length > 0) {
        const idx = updatedVariants.findIndex(v => v.name === variantName);
        if (idx !== -1) {
          updatedVariants[idx].stock = (updatedVariants[idx].stock || 0) + qty;
          newStock = updatedVariants[idx].stock;
        } else {
          return res.status(400).json({ message: 'Product variant not found' });
        }
        const totalStock = updatedVariants.reduce((acc, v) => acc + (v.stock || 0), 0);
        updatedProduct = jsonDb.findByIdAndUpdate('products', productId, {
          variants: updatedVariants,
          stock: totalStock
        });
      } else {
        newStock = (product.stock || 0) + qty;
        updatedProduct = jsonDb.findByIdAndUpdate('products', productId, { stock: newStock });
      }

      // Log to inventory log
      jsonDb.create('inventorylogs', {
        productId: product._id,
        productName: product.name,
        variantName: variantName || '',
        changeType: qty > 0 ? 'restock' : 'adjustment',
        quantityChanged: qty,
        stockAfterChange: newStock,
        description: description || 'Manual stock adjustment',
        performedBy: userName,
      });
    }

    res.json({ message: 'Stock updated successfully', product: updatedProduct });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

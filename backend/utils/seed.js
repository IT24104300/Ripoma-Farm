import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import connectDB from '../config/db.js';
import Customer from '../models/Customer.js';
import Admin, { DEFAULT_ROLE_PERMISSIONS } from '../models/Admin.js';
import User from '../models/User.js';
import Product from '../models/Product.js';
import Category from '../models/Category.js';
import Order from '../models/Order.js';
import InventoryLog from '../models/Inventory.js';
import Transaction from '../models/Transaction.js';
import Worker from '../models/Worker.js';
import Setting from '../models/Setting.js';
import Notification from '../models/Notification.js';
import { writeData } from './jsonDb.js';

dotenv.config();

const seedData = async () => {
  await connectDB();

  console.log('Starting Separated Database Seeding (Admin & Customer)...');

  // Password hashes with secure salts
  const salt = await bcrypt.genSalt(10);
  const adminPassword = await bcrypt.hash('Admin@1234', salt); // Min 10 chars
  const workerPassword = await bcrypt.hash('Worker@1234', salt); // Min 10 chars
  const customerPassword = await bcrypt.hash('Customer@123', salt); // Min 8 chars

  // 1. Admins table (Super Admin & Workers with Dashboard Access)
  const admins = [
    {
      _id: '660a1234b123456789abcdef',
      name: 'Super Administrator',
      email: 'admin@ripomafarm.com',
      password: adminPassword,
      role: 'super_admin',
      permissions: DEFAULT_ROLE_PERMISSIONS.super_admin,
      two_factor_enabled: true,
      two_factor_secret: 'RIPOMA-SECURE-2FA-FARM',
      status: 'active',
      phone: '+1 (555) 012-3456',
      failedLoginAttempts: 0,
      lockoutUntil: null,
      loginHistory: [],
      createdAt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      _id: '660b1234b123456789abcdef',
      name: 'Worker Dave',
      email: 'worker@ripomafarm.com',
      password: workerPassword,
      role: 'supervisor',
      permissions: DEFAULT_ROLE_PERMISSIONS.supervisor,
      two_factor_enabled: true,
      two_factor_secret: 'RIPOMA-SECURE-2FA-FARM',
      status: 'active',
      phone: '+1 (555) 012-7890',
      failedLoginAttempts: 0,
      lockoutUntil: null,
      loginHistory: [],
      createdAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
    }
  ];

  // 2. Customers table (Storefront Customers only)
  const customers = [
    {
      _id: '660c1234b123456789abcdef',
      name: 'Sarah Customer',
      email: 'customer@ripomafarm.com',
      password: customerPassword,
      phone: '+1 (555) 012-5555',
      addresses: [
        {
          street: '456 Garden Avenue',
          city: 'Bloomfield',
          state: 'SunnyState',
          zipCode: '10001',
          country: 'Agroland',
          isDefault: true
        }
      ],
      loyalty_points: 120,
      wishlist: [],
      status: 'active',
      failedLoginAttempts: 0,
      lockoutUntil: null,
      loginHistory: [],
      createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    }
  ];

  // 3. Categories
  const categories = [
    { name: 'Dry Fish', description: 'Sun-dried high quality marine fish, processed hygienically.', subcategories: ['Anchovy', 'Shrimp', 'Mackerel'] },
    { name: 'Eggs', description: 'Fresh, organic free-range chicken eggs gathered daily.', subcategories: ['Tray Pack', 'Box Pack', 'Grade A', 'Grade B'] },
    { name: 'Chicken', description: 'Organic farm-raised fresh chicken cuts and whole chickens.', subcategories: ['Whole Chicken', 'Cuts', 'Wings', 'Drumsticks', 'Breasts'] }
  ];

  // 4. Products
  const products = [
    {
      _id: '660d1234b123456789abcde1',
      name: 'Sun-Dried Anchovy (Neetholi)',
      description: 'Hygienically sun-dried Anchovies. Rich in Calcium, Protein, and Omega-3. Salted moderately and packed tightly to preserve freshness.',
      category: 'Dry Fish',
      subcategory: 'Anchovy',
      images: ['https://images.unsplash.com/photo-1534482421-64566f976cfa?w=600'],
      basePrice: 8.50,
      costPrice: 4.20,
      discount: 10,
      stock: 75,
      sku: 'RIP-DRY-ANC01',
      variants: [
        { name: '100g Pack', price: 8.50, costPrice: 4.20, stock: 30, sku: 'RIP-DRY-ANC-100' },
        { name: '250g Pack', price: 19.50, costPrice: 9.80, stock: 25, sku: 'RIP-DRY-ANC-250' },
        { name: '500g Pack', price: 36.00, costPrice: 18.00, stock: 20, sku: 'RIP-DRY-ANC-500' }
      ],
      specifications: { Size: 'Medium', Type: 'Salted', ShelfLife: '6 Months', Origin: 'Coastal Harvest' },
      rating: 4.8,
      reviews: [
        { userName: 'Sarah Customer', rating: 5, comment: 'Very clean and tasty. Not too salty!', createdAt: new Date() }
      ]
    },
    {
      _id: '660d1234b123456789abcde2',
      name: 'Premium Dried Shrimp (Chemmeen)',
      description: 'Handpicked and sun-dried organic prawns. Shell removed, ready to cook. No artificial colors or preservatives added.',
      category: 'Dry Fish',
      subcategory: 'Shrimp',
      images: ['https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=600'],
      basePrice: 12.00,
      costPrice: 6.00,
      discount: 0,
      stock: 45,
      sku: 'RIP-DRY-SHR01',
      variants: [
        { name: '100g Pack', price: 12.00, costPrice: 6.00, stock: 25, sku: 'RIP-DRY-SHR-100' },
        { name: '250g Pack', price: 27.50, costPrice: 13.50, stock: 20, sku: 'RIP-DRY-SHR-250' }
      ],
      specifications: { Size: 'Large', Type: 'Unsalted', ShelfLife: '6 Months', Origin: 'Coastal Harvest' },
      rating: 4.6,
      reviews: []
    },
    {
      _id: '660d1234b123456789abcde3',
      name: 'Organic Farm Fresh Eggs (Brown)',
      description: 'Nutritious, brown-shelled eggs from free-range pasture-raised chickens fed with organic grains. Gathered daily.',
      category: 'Eggs',
      subcategory: 'Grade A',
      images: ['https://images.unsplash.com/photo-1506976785307-8732e854ad03?w=600'],
      basePrice: 9.99,
      costPrice: 4.50,
      discount: 5,
      stock: 120,
      sku: 'RIP-EGG-FRESH',
      variants: [
        { name: 'Tray of 30 (Grade A)', price: 9.99, costPrice: 4.50, stock: 80, sku: 'RIP-EGG-T30-A' },
        { name: 'Box of 300 (Grade A)', price: 89.99, costPrice: 40.00, stock: 40, sku: 'RIP-EGG-B300-A' }
      ],
      specifications: { Grade: 'Grade A', Color: 'Brown', Feed: 'Organic Grains', FarmType: 'Free Range' },
      rating: 4.9,
      reviews: [
        { userName: 'Sarah Customer', rating: 5, comment: 'Yolks are deep yellow and taste amazing! Highly recommend.', createdAt: new Date() }
      ]
    },
    {
      _id: '660d1234b123456789abcde4',
      name: 'Whole Broiler Chicken',
      description: 'Fresh whole chicken, fully cleaned, gutted, and dressed. Frozen or fresh option. Tender, juicy meat, perfect for roasting.',
      category: 'Chicken',
      subcategory: 'Whole Chicken',
      images: ['https://images.unsplash.com/photo-1587593810167-a84920ea0781?w=600'],
      basePrice: 14.50,
      costPrice: 7.00,
      discount: 0,
      stock: 60,
      sku: 'RIP-CHK-WHOLE',
      variants: [
        { name: '1.2kg Size', price: 14.50, costPrice: 7.00, stock: 20, sku: 'RIP-CHK-W-12' },
        { name: '1.5kg Size', price: 17.80, costPrice: 8.50, stock: 25, sku: 'RIP-CHK-W-15' },
        { name: '1.8kg Size', price: 21.00, costPrice: 10.00, stock: 15, sku: 'RIP-CHK-W-18' }
      ],
      specifications: { Type: 'Broiler', Preparation: 'Fully Dressed', Freshness: 'Fresh Farm Cut', Feed: 'Corn-fed' },
      rating: 4.7,
      reviews: []
    },
    {
      _id: '660d1234b123456789abcde5',
      name: 'Premium Chicken Breast (Boneless)',
      description: 'Skinless and boneless chicken breast cuts. Tender and high in protein, ideal for gym diets, grilling, or curries.',
      category: 'Chicken',
      subcategory: 'Cuts',
      images: ['https://images.unsplash.com/photo-1604503468506-a8da13d82791?w=600'],
      basePrice: 8.99,
      costPrice: 4.00,
      discount: 15,
      stock: 8,
      sku: 'RIP-CHK-BREAST',
      variants: [
        { name: '500g Pack', price: 8.99, costPrice: 4.00, stock: 5, sku: 'RIP-CHK-B-500' },
        { name: '1kg Pack', price: 16.99, costPrice: 8.00, stock: 3, sku: 'RIP-CHK-B-1000' }
      ],
      specifications: { Type: 'Boneless', Prep: 'Skinless Cuts', Packaging: 'Vaccum Sealed', Temp: 'Chilled' },
      rating: 4.5,
      reviews: []
    }
  ];

  // 5. Global Settings
  const settings = [
    {
      _id: '660e1234b123456789abcdef',
      key: 'global_settings',
      companyName: 'RIPOMA Farm & Foods',
      contactEmail: 'support@ripomafarm.com',
      contactPhone: '+1 (555) 747-6622',
      address: '10 Organic Way, Agro Valley, GreenState',
      taxRate: 5,
      shippingFee: 8.50,
      currency: 'USD',
      stripeEnabled: true,
      paypalEnabled: false,
      cashOnDeliveryEnabled: true
    }
  ];

  // 6. Workers
  const workers = [
    {
      _id: '660f1234b123456789abcdef',
      userId: '660b1234b123456789abcdef', // Worker Dave Admin Record
      name: 'Worker Dave',
      email: 'worker@ripomafarm.com',
      phone: '+1 (555) 012-7890',
      status: 'active',
      role: 'Poultry Supervisor',
      hourlyRate: 18,
      tasks: [
        { _id: '660f1234b123456789abcd01', title: 'Feed Chickens in Barn B', description: 'Ensure the corn feeder is full before 5 PM', status: 'completed', assignedDate: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString() },
        { _id: '660f1234b123456789abcd02', title: 'Gather eggs from Barn A', description: 'Collect and grade brown eggs into trays', status: 'in_progress', assignedDate: new Date().toISOString() },
        { _id: '660f1234b123456789abcd03', title: 'Clean Barn C', description: 'Sanitize nests and floorboards', status: 'todo', assignedDate: new Date().toISOString() }
      ],
      attendance: [
        { date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], status: 'present' },
        { date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], status: 'present' },
        { date: new Date().toISOString().split('T')[0], status: 'present' }
      ]
    }
  ];

  // 7. Orders
  const orders = [
    {
      _id: '660f7774b123456789abcde1',
      user: '660c1234b123456789abcdef', // Sarah Customer
      customerDetails: {
        name: 'Sarah Customer',
        email: 'customer@ripomafarm.com',
        phone: '+1 (555) 012-5555',
        street: '456 Garden Avenue',
        city: 'Bloomfield',
        state: 'SunnyState',
        zipCode: '10001',
        country: 'Agroland'
      },
      items: [
        {
          productId: '660d1234b123456789abcde3',
          name: 'Organic Farm Fresh Eggs (Brown)',
          image: 'https://images.unsplash.com/photo-1506976785307-8732e854ad03?w=600',
          variantName: 'Tray of 30 (Grade A)',
          quantity: 2,
          price: 9.99,
          costPrice: 4.50
        },
        {
          productId: '660d1234b123456789abcde1',
          name: 'Sun-Dried Anchovy (Neetholi)',
          image: 'https://images.unsplash.com/photo-1534482421-64566f976cfa?w=600',
          variantName: '100g Pack',
          quantity: 1,
          price: 8.50,
          costPrice: 4.20
        }
      ],
      subtotal: 28.48,
      shippingFee: 8.50,
      tax: 1.42,
      total: 38.40,
      paymentMethod: 'Stripe',
      paymentStatus: 'paid',
      orderStatus: 'Delivered',
      invoiceNumber: 'INV-1204-098',
      createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      _id: '660f7774b123456789abcde2',
      user: '660c1234b123456789abcdef', // Sarah Customer
      customerDetails: {
        name: 'Sarah Customer',
        email: 'customer@ripomafarm.com',
        phone: '+1 (555) 012-5555',
        street: '456 Garden Avenue',
        city: 'Bloomfield',
        state: 'SunnyState',
        zipCode: '10001',
        country: 'Agroland'
      },
      items: [
        {
          productId: '660d1234b123456789abcde4',
          name: 'Whole Broiler Chicken',
          image: 'https://images.unsplash.com/photo-1587593810167-a84920ea0781?w=600',
          variantName: '1.5kg Size',
          quantity: 1,
          price: 17.80,
          costPrice: 8.50
        }
      ],
      subtotal: 17.80,
      shippingFee: 8.50,
      tax: 0.89,
      total: 27.19,
      paymentMethod: 'Cash on Delivery',
      paymentStatus: 'pending',
      orderStatus: 'Pending',
      invoiceNumber: 'INV-0604-001',
      createdAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
    }
  ];

  // 8. Transactions
  const transactions = [
    { type: 'income', amount: 480.00, costOfGoods: 220.00, category: 'sales', description: 'March Sales Aggregation', date: new Date('2026-03-25T12:00:00Z') },
    { type: 'expense', amount: 150.00, category: 'salary', description: 'Dave Wages March', date: new Date('2026-03-30T17:00:00Z') },
    { type: 'expense', amount: 90.00, category: 'inventory_purchase', description: 'Feed purchase Barn A', date: new Date('2026-03-05T09:00:00Z') },
    { type: 'income', amount: 720.00, costOfGoods: 310.00, category: 'sales', description: 'April Sales Aggregation', date: new Date('2026-04-20T12:00:00Z') },
    { type: 'expense', amount: 150.00, category: 'salary', description: 'Dave Wages April', date: new Date('2026-04-30T17:00:00Z') },
    { type: 'expense', amount: 120.00, category: 'inventory_purchase', description: 'Egg box cartons bought', date: new Date('2026-04-12T10:00:00Z') },
    { type: 'income', amount: 1150.00, costOfGoods: 530.00, category: 'sales', description: 'May Sales Aggregation', date: new Date('2026-05-18T12:00:00Z') },
    { type: 'expense', amount: 180.00, category: 'salary', description: 'Dave Wages May', date: new Date('2026-05-31T17:00:00Z') },
    { type: 'expense', amount: 80.00, category: 'other_expense', description: 'Power/Utilities Barn B', date: new Date('2026-05-15T08:00:00Z') },
    { type: 'income', amount: 38.40, costOfGoods: 13.20, category: 'sales', description: 'Order #660f7774b123456789abcde1', date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
    { type: 'income', amount: 27.19, costOfGoods: 8.50, category: 'sales', description: 'Order #660f7774b123456789abcde2', date: new Date(Date.now() - 12 * 60 * 60 * 1000) }
  ];

  // 9. Notifications
  const notifications = [
    { title: 'Welcome to Ripoma Farm', message: 'The Ripoma Farm MERN application is ready for business.', type: 'info', roleRecipient: 'all', createdAt: new Date() },
    { title: 'Low Stock Alert', message: 'Product "Premium Chicken Breast (Boneless)" (Base) is running low. Current stock: 8', type: 'warning', roleRecipient: 'admin', createdAt: new Date() }
  ];

  // 10. Inventory Logs
  const inventorylogs = [
    { productId: '660d1234b123456789abcde5', productName: 'Premium Chicken Breast (Boneless)', variantName: '500g Pack', changeType: 'restock', quantityChanged: 5, stockAfterChange: 5, description: 'Initial seed stock', performedBy: 'Super Administrator', createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString() },
    { productId: '660d1234b123456789abcde5', productName: 'Premium Chicken Breast (Boneless)', variantName: '1kg Pack', changeType: 'restock', quantityChanged: 3, stockAfterChange: 3, description: 'Initial seed stock', performedBy: 'Super Administrator', createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString() }
  ];

  if (global.dbConnected) {
    try {
      await Admin.deleteMany({});
      await Customer.deleteMany({});
      await User.deleteMany({});
      await Product.deleteMany({});
      await Category.deleteMany({});
      await Order.deleteMany({});
      await InventoryLog.deleteMany({});
      await Transaction.deleteMany({});
      await Worker.deleteMany({});
      await Setting.deleteMany({});
      await Notification.deleteMany({});

      await Admin.insertMany(admins);
      await Customer.insertMany(customers);
      await Category.insertMany(categories);
      await Product.insertMany(products);
      await Setting.insertMany(settings);
      await Worker.insertMany(workers);
      await Order.insertMany(orders);
      await Transaction.insertMany(transactions);
      await Notification.insertMany(notifications);
      await InventoryLog.insertMany(inventorylogs);

      console.log('✅ MongoDB Seeding Complete! Separate Admin & Customer collections seeded.');
    } catch (err) {
      console.error('❌ Mongoose Seed Error:', err.message);
    }
  } else {
    try {
      writeData('admins', admins);
      writeData('customers', customers);
      writeData('categories', categories);
      writeData('products', products);
      writeData('settings', settings);
      writeData('workers', workers);
      writeData('orders', orders);
      writeData('transactions', transactions);
      writeData('notifications', notifications);
      writeData('inventorylogs', inventorylogs);

      console.log('✅ JSON File Seeding Complete! Separate admin and customer collections written.');
    } catch (err) {
      console.error('❌ JSON Seed Error:', err.message);
    }
  }

  if (global.dbConnected) {
    mongoose.connection.close();
  }
  process.exit();
};

seedData();

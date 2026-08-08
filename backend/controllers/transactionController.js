import Transaction from '../models/Transaction.js';
import Order from '../models/Order.js';
import User from '../models/User.js';
import Product from '../models/Product.js';
import { jsonDb } from '../utils/jsonDb.js';

// @desc    Get dashboard metrics & trends
// @route   GET /api/transactions/stats
// @access  Private/Admin
export const getDashboardStats = async (req, res) => {
  try {
    let transactions = [];
    let orders = [];
    let customers = [];
    let products = [];

    if (global.dbConnected) {
      transactions = await Transaction.find({});
      orders = await Order.find({});
      customers = await User.find({ role: 'customer' });
      products = await Product.find({});
    } else {
      transactions = jsonDb.find('transactions');
      orders = jsonDb.find('orders');
      customers = jsonDb.find('users', u => u.role === 'customer');
      products = jsonDb.find('products');
    }

    // Calculations
    const totalRevenue = transactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);

    const totalExpenses = transactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);

    // Profit calculation: (Revenue - Cost of Goods Sold) - Other Expenses
    const costOfGoodsSold = transactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + (t.costOfGoods || 0), 0);
    const grossProfit = totalRevenue - costOfGoodsSold;
    const netProfit = grossProfit - totalExpenses;

    // Period Margins Calculations (Daily, Weekly, Monthly)
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const startOfMonth = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const calculateStatsForPeriod = (startDate) => {
      const filtered = transactions.filter(t => new Date(t.date || t.createdAt) >= startDate);
      const revenue = filtered.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
      const cogs = filtered.filter(t => t.type === 'income').reduce((sum, t) => sum + (t.costOfGoods || 0), 0);
      const expenses = filtered.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
      const profit = revenue - cogs - expenses;
      const marginPercent = revenue > 0 ? ((profit / revenue) * 100).toFixed(1) : '0.0';
      return { revenue, cogs, expenses, profit, marginPercent: parseFloat(marginPercent) };
    };

    const dailyStats = calculateStatsForPeriod(startOfToday);
    const weeklyStats = calculateStatsForPeriod(startOfWeek);
    const monthlyStats = calculateStatsForPeriod(startOfMonth);

    // Low stock count
    const lowStockAlerts = products.filter(p => p.stock < 10 && !p.isDeleted);

    // Sales Trends (Group by Month for the last 6 months)
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const salesTrendsMap = {};
    const last6Months = [];
    
    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const mName = months[d.getMonth()];
      salesTrendsMap[mName] = { sales: 0, profit: 0, month: mName };
      last6Months.push(mName);
    }

    transactions.forEach(t => {
      const tDate = new Date(t.date || t.createdAt);
      const mName = months[tDate.getMonth()];
      if (salesTrendsMap[mName]) {
        if (t.type === 'income') {
          salesTrendsMap[mName].sales += t.amount;
          salesTrendsMap[mName].profit += (t.amount - (t.costOfGoods || 0));
        } else {
          salesTrendsMap[mName].profit -= t.amount;
        }
      }
    });

    const monthlySalesTrends = last6Months.map(m => salesTrendsMap[m]);

    // Top Selling Products based on orders
    const productSalesMap = {};
    orders.forEach(order => {
      order.items.forEach(item => {
        const id = item.productId.toString();
        if (!productSalesMap[id]) {
          productSalesMap[id] = { name: item.name, quantity: 0, revenue: 0 };
        }
        productSalesMap[id].quantity += item.quantity;
        productSalesMap[id].revenue += item.price * item.quantity;
      });
    });

    const topSellingProducts = Object.values(productSalesMap)
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 5);

    // Customer growth trends (registered in the last 6 months)
    const customerGrowthTrends = last6Months.map(m => ({ month: m, count: 0 }));
    customers.forEach(c => {
      const cDate = new Date(c.createdAt);
      const mName = months[cDate.getMonth()];
      const trend = customerGrowthTrends.find(t => t.month === mName);
      if (trend) trend.count += 1;
    });

    // Accumulate customer counts to show growth curves
    let runningTotal = customers.length - customerGrowthTrends.reduce((sum, t) => sum + t.count, 0);
    customerGrowthTrends.forEach(t => {
      runningTotal += t.count;
      t.count = runningTotal;
    });

    res.json({
      summary: {
        totalRevenue,
        todaySales: dailyStats.revenue,
        netProfit,
        totalProducts: products.filter(p => !p.isDeleted).length,
        lowStockCount: lowStockAlerts.length,
        totalOrders: orders.length,
        totalCustomers: customers.length,
      },
      margins: {
        daily: dailyStats,
        weekly: weeklyStats,
        monthly: monthlyStats
      },
      monthlySalesTrends,
      topSellingProducts,
      customerGrowthTrends,
      lowStockAlerts: lowStockAlerts.map(p => ({ _id: p._id, name: p.name, stock: p.stock, category: p.category })),
      recentTransactions: transactions.sort((a, b) => new Date(b.date || b.createdAt) - new Date(a.date || a.createdAt)).slice(0, 10),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all transactions
// @route   GET /api/transactions
// @access  Private/Admin
export const getTransactions = async (req, res) => {
  try {
    let transactions = [];
    if (global.dbConnected) {
      transactions = await Transaction.find({}).sort({ date: -1 });
    } else {
      transactions = jsonDb.find('transactions').sort((a, b) => new Date(b.date || b.createdAt) - new Date(a.date || a.createdAt));
    }
    res.json(transactions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create a transaction (manual log)
// @route   POST /api/transactions
// @access  Private/Admin
export const createTransaction = async (req, res) => {
  const { type, amount, category, description, date, costOfGoods, referenceId } = req.body;
  try {
    if (global.dbConnected) {
      const transaction = new Transaction({
        type,
        amount,
        category,
        description,
        date: date || new Date(),
        costOfGoods: costOfGoods || 0,
        referenceId: referenceId || ''
      });
      const created = await transaction.save();
      res.status(201).json(created);
    } else {
      const created = jsonDb.create('transactions', {
        type,
        amount: Number(amount),
        category,
        description,
        date: date || new Date().toISOString(),
        costOfGoods: Number(costOfGoods || 0),
        referenceId: referenceId || ''
      });
      res.status(201).json(created);
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

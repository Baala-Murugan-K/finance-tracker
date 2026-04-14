const Budget = require('../models/Budget');
const Transaction = require('../models/Transaction');
const nodemailer = require('nodemailer');
const User = require('../models/User');

const sendBudgetAlert = async (email, name, category, limitAmount, spent) => {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });

  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to: email,
    subject: `Budget Exceeded 🚨`,
    html: `
      <h2>Hi ${name},</h2>
      <p>You have exceeded your <strong>${category}</strong> budget.</p>
      <p>Limit: ₹${limitAmount}</p>
      <p>Spent: ₹${spent}</p>
      <p>Take action to control your expenses.</p>
    `
  });
};

// @POST /api/budget
const setBudget = async (req, res) => {
  try {
    const { category, limitAmount, month, year } = req.body;

    const existing = await Budget.findOne({
      userId: req.user.id, category, month, year
    });

    if (existing) {
      existing.limitAmount = limitAmount;
      await existing.save();
      return res.json(existing);
    }

    const budget = await Budget.create({
      userId: req.user.id, category, limitAmount, month, year
    });

    res.status(201).json(budget);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @GET /api/budget
const getBudgets = async (req, res) => {
  try {
    const { month, year } = req.query;
    const filter = { userId: req.user.id };
    if (month) filter.month = month;
    if (year) filter.year = year;

    const budgets = await Budget.find(filter);

    // Calculate spent per category
    const result = await Promise.all(budgets.map(async (budget) => {
      const transactions = await Transaction.find({
        userId: req.user.id,
        category: budget.category,
        type: 'expense',
        date: {
          $gte: new Date(budget.year, budget.month - 1, 1),
          $lt: new Date(budget.year, budget.month, 1)
        }
      });

      const spent = transactions.reduce((sum, t) => sum + t.amount, 0);
      const percentage = Math.round((spent / budget.limitAmount) * 100);

      return {
        ...budget.toObject(),
        spent,
        percentage,
        status: percentage >= 100 ? 'exceeded' : percentage >= 80 ? 'warning' : 'safe'
      };
    }));

    res.json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @PUT /api/budget/:id
const updateBudget = async (req, res) => {
  try {
    const budget = await Budget.findById(req.params.id);
    if (!budget) return res.status(404).json({ message: 'Budget not found' });
    if (budget.userId.toString() !== req.user.id) {
      return res.status(401).json({ message: 'Not authorized' });
    }
    const updated = await Budget.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @DELETE /api/budget/:id
const deleteBudget = async (req, res) => {
  try {
    const budget = await Budget.findById(req.params.id);
    if (!budget) return res.status(404).json({ message: 'Budget not found' });
    if (budget.userId.toString() !== req.user.id) {
      return res.status(401).json({ message: 'Not authorized' });
    }
    await Budget.findByIdAndDelete(req.params.id);
    res.json({ message: 'Budget deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Called by cron job
const checkAndAlertBudgets = async () => {
  try {
    const now = new Date();
    const month = now.getMonth() + 1;
    const year = now.getFullYear();

    const budgets = await Budget.find({ month, year });

    for (const budget of budgets) {
      const transactions = await Transaction.find({
        userId: budget.userId,
        category: budget.category,
        type: 'expense',
        date: {
          $gte: new Date(year, month - 1, 1),
          $lt: new Date(year, month, 1)
        }
      });

      const spent = transactions.reduce((sum, t) => sum + t.amount, 0);

      if (spent >= budget.limitAmount) {
        const user = await User.findById(budget.userId);
        if (user) {
          await sendBudgetAlert(user.email, user.name, budget.category, budget.limitAmount, spent);
        }
      }
    }
  } catch (error) {
    console.error('Cron job error:', error.message);
  }
};

module.exports = { setBudget, getBudgets, updateBudget, deleteBudget, checkAndAlertBudgets };
const Transaction = require('../models/Transaction');
const Budget = require('../models/Budget');
const User = require('../models/User');
const nodemailer = require('nodemailer');
// @POST /api/transactions
const sendBudgetExceededEmail = async (userId, category, spent, limitAmount, userName, userEmail) => {
  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: userEmail,
      subject: `Budget Exceeded 🚨`,
      html: `
        <h2>Hi ${userName},</h2>
        <p>You have exceeded your <strong>${category}</strong> budget.</p>
        <p><strong>Limit:</strong> ₹${limitAmount}</p>
        <p><strong>Spent:</strong> ₹${spent}</p>
        <p>Take action to control your expenses.</p>
      `
    });

    console.log(`Budget alert sent to ${userEmail} for ${category}`);
  } catch (err) {
    console.error('Email alert error:', err.message);
  }
};

const addTransaction = async (req, res) => {
  try {
    const { type, amount, category, note, date } = req.body;

    const transaction = await Transaction.create({
      userId: req.user.id,
      type,
      amount,
      category,
      note,
      date: date || Date.now()
    });

    // Only check budget for expenses
    if (type === 'expense') {
  const now = new Date();
  const month = now.getMonth() + 1;
  const year = now.getFullYear();

  console.log(`Checking budget for category: ${category}, month: ${month}, year: ${year}, userId: ${req.user.id}`);

  const budget = await Budget.findOne({
    userId: req.user.id,
    category,
    month,
    year
  });

  console.log(`Budget found:`, budget);

  if (budget) {
    const transactions = await Transaction.find({
      userId: req.user.id,
      category,
      type: 'expense',
      date: {
        $gte: new Date(year, month - 1, 1),
        $lt: new Date(year, month, 1)
      }
    });

    const totalSpent = transactions.reduce((sum, t) => sum + t.amount, 0);
    const previousSpent = totalSpent - amount;

    console.log(`Total spent: ${totalSpent}, Previous spent: ${previousSpent}, Limit: ${budget.limitAmount}`);
    console.log(`Should send email: ${previousSpent < budget.limitAmount && totalSpent >= budget.limitAmount}`);

    if (previousSpent < budget.limitAmount && totalSpent >= budget.limitAmount) {
      const user = await User.findById(req.user.id);
      if (user) {
        sendBudgetExceededEmail(
          req.user.id,
          category,
          totalSpent,
          budget.limitAmount,
          user.name,
          user.email
        );
      }
    }
  }
}

    res.status(201).json(transaction);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
// @GET /api/transactions
const getTransactions = async (req, res) => {
  try {
    const { month, year, category, type } = req.query;

    let filter = { userId: req.user.id };

    if (month && year) {
      filter.date = {
        $gte: new Date(year, month - 1, 1),
        $lt: new Date(year, month, 1)
      };
    }

    if (category) filter.category = category;
    if (type) filter.type = type;

    const transactions = await Transaction.find(filter).sort({ date: -1 });
    res.json(transactions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @PUT /api/transactions/:id
const updateTransaction = async (req, res) => {
  try {
    const transaction = await Transaction.findById(req.params.id);

    if (!transaction) {
      return res.status(404).json({ message: 'Transaction not found' });
    }

    if (transaction.userId.toString() !== req.user.id) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    const updated = await Transaction.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @DELETE /api/transactions/:id
const deleteTransaction = async (req, res) => {
  try {
    const transaction = await Transaction.findById(req.params.id);

    if (!transaction) {
      return res.status(404).json({ message: 'Transaction not found' });
    }

    if (transaction.userId.toString() !== req.user.id) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    await Transaction.findByIdAndDelete(req.params.id);
    res.json({ message: 'Transaction deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @GET /api/transactions/summary
const getSummary = async (req, res) => {
  try {
    const { month, year } = req.query;

    let filter = { userId: req.user.id };

    if (month && year) {
      filter.date = {
        $gte: new Date(year, month - 1, 1),
        $lt: new Date(year, month, 1)
      };
    }

    const transactions = await Transaction.find(filter);

    const totalIncome = transactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);

    const totalExpense = transactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);

    const savings = totalIncome - totalExpense;

    res.json({ totalIncome, totalExpense, savings });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  addTransaction,
  getTransactions,
  updateTransaction,
  deleteTransaction,
  getSummary
};
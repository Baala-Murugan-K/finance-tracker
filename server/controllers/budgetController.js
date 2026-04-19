const Budget = require('../models/Budget');
const Transaction = require('../models/Transaction');
const nodemailer = require('nodemailer');
const User = require('../models/User');

const sendBudgetAlert = async (email, name, category, limitAmount, spent) => {
  try {
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    });

    const exceededBy = spent - limitAmount;
    const percentage = Math.round((spent / limitAmount) * 100);

    await transporter.sendMail({
      from: `"Finance Tracker" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: `🚨 Budget Exceeded — ${category}`,
      html: `
        <div style="font-family:Arial,sans-serif;max-width:500px;margin:auto;border:1px solid #eee;border-radius:10px;overflow:hidden">
          <div style="background:#ef4444;padding:20px;text-align:center">
            <h1 style="color:white;margin:0">🚨 Budget Alert</h1>
          </div>
          <div style="padding:24px">
            <h2 style="color:#1f2937">Hi ${name},</h2>
            <p style="color:#6b7280">You have exceeded your <strong>${category}</strong> budget for this month.</p>
            
            <div style="background:#fef2f2;border:1px solid #fecaca;border-radius:8px;padding:16px;margin:20px 0">
              <table style="width:100%;border-collapse:collapse">
                <tr>
                  <td style="padding:8px 0;color:#6b7280">Budget Limit</td>
                  <td style="padding:8px 0;text-align:right;font-weight:bold;color:#1f2937">₹${limitAmount.toLocaleString()}</td>
                </tr>
                <tr>
                  <td style="padding:8px 0;color:#6b7280">Total Spent</td>
                  <td style="padding:8px 0;text-align:right;font-weight:bold;color:#ef4444">₹${spent.toLocaleString()}</td>
                </tr>
                <tr style="border-top:1px solid #fecaca">
                  <td style="padding:8px 0;color:#6b7280">Exceeded By</td>
                  <td style="padding:8px 0;text-align:right;font-weight:bold;color:#ef4444">₹${exceededBy.toLocaleString()}</td>
                </tr>
                <tr>
                  <td style="padding:8px 0;color:#6b7280">Usage</td>
                  <td style="padding:8px 0;text-align:right;font-weight:bold;color:#ef4444">${percentage}% of budget used</td>
                </tr>
              </table>
            </div>

            <p style="color:#6b7280">Please review your spending and take action to control your expenses.</p>
            <p style="color:#9ca3af;font-size:12px;margin-top:24px">— Finance Tracker</p>
          </div>
        </div>
      `
    });
  } catch (err) {
    console.error('Cron job email error:', err.message);
  }
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
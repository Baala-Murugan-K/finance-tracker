const Transaction = require('../models/Transaction');

// @GET /api/insights
const getInsights = async (req, res) => {
  try {
    const userId = req.user.id;
    const now = new Date();
    const insights = [];

    // Last 6 months data
    const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1);
    const transactions = await Transaction.find({
      userId,
      date: { $gte: sixMonthsAgo }
    });

    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    const thisMonthTx = transactions.filter(t => {
      const d = new Date(t.date);
      return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
    });

    const income = thisMonthTx.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
    const expense = thisMonthTx.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);

    // Rule 1: High spending month
    if (income > 0 && expense / income > 0.4) {
      insights.push({
        type: 'warning',
        message: `High spending month — you've spent ${Math.round((expense / income) * 100)}% of your income.`
      });
    }

    // Rule 2: Recurring category detection (3 consecutive months)
    const categoryMonths = {};
    transactions.filter(t => t.type === 'expense').forEach(t => {
      const month = new Date(t.date).getMonth();
      if (!categoryMonths[t.category]) categoryMonths[t.category] = new Set();
      categoryMonths[t.category].add(month);
    });

    Object.entries(categoryMonths).forEach(([category, months]) => {
      if (months.size >= 3) {
        insights.push({
          type: 'info',
          message: `Recurring pattern detected in ${category} — you've spent here for ${months.size} months straight.`
        });
      }
    });

    // Rule 3: Savings rate
    const savings = income - expense;
    if (income > 0) {
      const savingsRate = Math.round((savings / income) * 100);
      insights.push({
        type: savingsRate >= 20 ? 'success' : 'warning',
        message: savingsRate >= 20
          ? `Good job — you saved ${savingsRate}% of your income this month.`
          : `Low savings — you only saved ${savingsRate}% of your income this month.`
      });
    }

    // Monthly trend (last 6 months)
    const monthlyTrend = [];
    for (let i = 5; i >= 0; i--) {
      const m = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const month = m.getMonth();
      const year = m.getFullYear();

      const monthTx = transactions.filter(t => {
        const d = new Date(t.date);
        return d.getMonth() === month && d.getFullYear() === year;
      });

      monthlyTrend.push({
        month: m.toLocaleString('default', { month: 'short' }),
        year,
        income: monthTx.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0),
        expense: monthTx.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0)
      });
    }

    res.json({ insights, monthlyTrend });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getInsights };
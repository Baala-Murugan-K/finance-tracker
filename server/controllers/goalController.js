const Goal = require('../models/Goal');
const User = require('../models/User');
const nodemailer = require('nodemailer');
// @POST /api/goals
const createGoal = async (req, res) => {
  try {
    const { title, targetAmount, savedAmount, deadline } = req.body;
    const goal = await Goal.create({
      userId: req.user.id, title, targetAmount, savedAmount, deadline
    });
    res.status(201).json(goal);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @GET /api/goals
const getGoals = async (req, res) => {
  try {
    const goals = await Goal.find({ userId: req.user.id });

    const result = goals.map(goal => {
      const percentage = Math.round((goal.savedAmount / goal.targetAmount) * 100);
      const daysLeft = Math.ceil((new Date(goal.deadline) - new Date()) / (1000 * 60 * 60 * 24));
      return {
        ...goal.toObject(),
        percentage,
        daysLeft,
        status: percentage >= 100 ? 'completed' : daysLeft < 0 ? 'overdue' : 'active'
      };
    });

    res.json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
//
const sendGoalAchievedEmail = async (userId, goalTitle, targetAmount, savingsHistory) => {
  try {
    const user = await User.findById(userId);
    if (!user) return;

    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    });

    // Build savings history table rows
    const historyRows = savingsHistory.map(h => `
      <tr>
        <td style="padding:8px;color:#6b7280;font-size:13px">${new Date(h.date).toLocaleDateString('en-IN', { day:'2-digit', month:'short', year:'numeric' })}</td>
        <td style="padding:8px;text-align:right;font-weight:bold;color:#10b981;font-size:13px">+₹${h.amount.toLocaleString()}</td>
        <td style="padding:8px;color:#9ca3af;font-size:13px">${h.note || '—'}</td>
      </tr>
    `).join('');

    await transporter.sendMail({
      from: `"Finance Tracker" <${process.env.EMAIL_USER}>`,
      to: user.email,
      subject: `🏆 Goal Achieved — ${goalTitle}!`,
      html: `
        <div style="font-family:Arial,sans-serif;max-width:550px;margin:auto;border:1px solid #eee;border-radius:10px;overflow:hidden">
          
          <div style="background:linear-gradient(135deg,#10b981,#059669);padding:32px;text-align:center">
            <div style="font-size:60px">🏆</div>
            <h1 style="color:white;margin:8px 0 0">Goal Achieved!</h1>
            <p style="color:#d1fae5;margin:4px 0 0">You crushed it. Time to celebrate!</p>
          </div>

          <div style="padding:28px">
            <h2 style="color:#1f2937;margin-top:0">Congratulations, ${user.name}! 🎉</h2>
            <p style="color:#6b7280;line-height:1.6">
              You've successfully reached your savings goal. Your discipline and consistency paid off!
            </p>

            <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:8px;padding:20px;margin:20px 0;text-align:center">
              <p style="margin:0;color:#6b7280;font-size:14px">Goal Completed</p>
              <p style="margin:8px 0;color:#1f2937;font-size:22px;font-weight:bold">🎯 ${goalTitle}</p>
              <p style="margin:0;color:#10b981;font-size:28px;font-weight:bold">₹${targetAmount.toLocaleString()}</p>
              <p style="margin:4px 0 0;color:#6b7280;font-size:13px">Target Reached ✅</p>
            </div>

            <!-- Savings History -->
            <h3 style="color:#1f2937;margin-bottom:12px">📅 Your Savings Journey</h3>
            <div style="border:1px solid #e5e7eb;border-radius:8px;overflow:hidden">
              <table style="width:100%;border-collapse:collapse">
                <thead>
                  <tr style="background:#f9fafb">
                    <th style="padding:10px 8px;text-align:left;color:#6b7280;font-size:12px;font-weight:600">DATE</th>
                    <th style="padding:10px 8px;text-align:right;color:#6b7280;font-size:12px;font-weight:600">AMOUNT</th>
                    <th style="padding:10px 8px;text-align:left;color:#6b7280;font-size:12px;font-weight:600">NOTE</th>
                  </tr>
                </thead>
                <tbody style="divide-y:1px solid #f3f4f6">
                  ${historyRows}
                </tbody>
                <tfoot>
                  <tr style="background:#f0fdf4;border-top:2px solid #bbf7d0">
                    <td style="padding:10px 8px;font-weight:bold;color:#1f2937;font-size:13px">Total Saved</td>
                    <td style="padding:10px 8px;text-align:right;font-weight:bold;color:#10b981;font-size:14px">₹${targetAmount.toLocaleString()}</td>
                    <td></td>
                  </tr>
                </tfoot>
              </table>
            </div>

            <div style="background:#fffbeb;border:1px solid #fde68a;border-radius:8px;padding:16px;margin:20px 0">
              <p style="margin:0;color:#92400e;font-size:14px;text-align:center">
                💡 <strong>What's Next?</strong> Set a new goal and keep the momentum going!
              </p>
            </div>

            <div style="text-align:center;margin:24px 0 8px">
              <p style="color:#6b7280;font-size:14px;font-style:italic">
                "A goal properly set is halfway reached." — Zig Ziglar
              </p>
            </div>

            <p style="color:#9ca3af;font-size:12px;margin-top:24px;text-align:center">— Finance Tracker</p>
          </div>
        </div>
      `
    });

    console.log(`Goal achieved email sent to ${user.email}`);
  } catch (err) {
    console.error('Goal email error:', err.message);
  }
};
// @PUT /api/goals/:id
const updateGoal = async (req, res) => {
  try {
    const goal = await Goal.findById(req.params.id);
    if (!goal) return res.status(404).json({ message: 'Goal not found' });
    if (goal.userId.toString() !== req.user.id) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    const previousSaved = goal.savedAmount;
    const addedAmount = req.body.savedAmount - previousSaved;

    // Push to savings history if amount increased
    if (addedAmount > 0) {
      goal.savingsHistory.push({
        amount: addedAmount,
        date: new Date(),
        note: req.body.note || ''
      });
    }

    goal.savedAmount = req.body.savedAmount;
    if (req.body.title) goal.title = req.body.title;
    if (req.body.targetAmount) goal.targetAmount = req.body.targetAmount;
    if (req.body.deadline) goal.deadline = req.body.deadline;

    await goal.save();

    // Send email if goal just completed
    if (previousSaved < goal.targetAmount && goal.savedAmount >= goal.targetAmount) {
      sendGoalAchievedEmail(req.user.id, goal.title, goal.targetAmount, goal.savingsHistory);
    }

    res.json(goal);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @DELETE /api/goals/:id
const deleteGoal = async (req, res) => {
  try {
    const goal = await Goal.findById(req.params.id);
    if (!goal) return res.status(404).json({ message: 'Goal not found' });
    if (goal.userId.toString() !== req.user.id) {
      return res.status(401).json({ message: 'Not authorized' });
    }
    await Goal.findByIdAndDelete(req.params.id);
    res.json({ message: 'Goal deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { createGoal, getGoals, sendGoalAchievedEmail, updateGoal, deleteGoal };
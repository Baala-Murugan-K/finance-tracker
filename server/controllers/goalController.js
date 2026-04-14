const Goal = require('../models/Goal');

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

// @PUT /api/goals/:id
const updateGoal = async (req, res) => {
  try {
    const goal = await Goal.findById(req.params.id);
    if (!goal) return res.status(404).json({ message: 'Goal not found' });
    if (goal.userId.toString() !== req.user.id) {
      return res.status(401).json({ message: 'Not authorized' });
    }
    const updated = await Goal.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updated);
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

module.exports = { createGoal, getGoals, updateGoal, deleteGoal };
const mongoose = require('mongoose');

const goalSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  targetAmount: { type: Number, required: true },
  savedAmount: { type: Number, default: 0 },
  deadline: { type: Date, required: true },
  savingsHistory: [
    {
      amount: { type: Number, required: true },
      date: { type: Date, default: Date.now },
      note: { type: String, default: '' }
    }
  ]
}, { timestamps: true });

module.exports = mongoose.model('Goal', goalSchema);
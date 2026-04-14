import { useState, useEffect } from 'react';
import axios from '../api/axios';

const Goals = () => {
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [addAmount, setAddAmount] = useState({});
  const [form, setForm] = useState({
    title: '',
    targetAmount: '',
    savedAmount: '',
    deadline: ''
  });

  const fetchGoals = async () => {
    try {
      const res = await axios.get('/goals');
      setGoals(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchGoals(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/goals', form);
      setShowForm(false);
      setForm({ title: '', targetAmount: '', savedAmount: '', deadline: '' });
      fetchGoals();
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddSavings = async (goal) => {
    const amount = parseFloat(addAmount[goal._id] || 0);
    if (!amount || amount <= 0) return;
    try {
      await axios.put(`/goals/${goal._id}`, {
        savedAmount: goal.savedAmount + amount
      });
      setAddAmount({ ...addAmount, [goal._id]: '' });
      fetchGoals();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this goal?')) return;
    await axios.delete(`/goals/${id}`);
    fetchGoals();
  };

  const getStatusColor = (status) => {
    if (status === 'completed') return 'bg-green-100 text-green-700';
    if (status === 'overdue') return 'bg-red-100 text-red-700';
    return 'bg-blue-100 text-blue-700';
  };

  const getBarColor = (status) => {
    if (status === 'completed') return 'bg-green-500';
    if (status === 'overdue') return 'bg-red-500';
    return 'bg-blue-500';
  };

  return (
    <div className="bg-gray-100 min-h-screen p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Savings Goals</h1>
        <button
          onClick={() => setShowForm(true)}
          className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600"
        >
          + Add Goal
        </button>
      </div>

      {/* Add Form */}
      {showForm && (
        <div className="bg-white rounded-2xl p-6 shadow-sm mb-6">
          <h2 className="text-lg font-semibold text-gray-700 mb-4">Create New Goal</h2>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              type="text"
              placeholder="Goal title (e.g. Buy a Laptop)"
              value={form.title}
              onChange={e => setForm({ ...form, title: e.target.value })}
              required
              className="border border-gray-300 rounded-lg px-3 py-2"
            />
            <input
              type="number"
              placeholder="Target Amount (₹)"
              value={form.targetAmount}
              onChange={e => setForm({ ...form, targetAmount: e.target.value })}
              required
              className="border border-gray-300 rounded-lg px-3 py-2"
            />
            <input
              type="number"
              placeholder="Already Saved (₹)"
              value={form.savedAmount}
              onChange={e => setForm({ ...form, savedAmount: e.target.value })}
              className="border border-gray-300 rounded-lg px-3 py-2"
            />
            <input
              type="date"
              value={form.deadline}
              onChange={e => setForm({ ...form, deadline: e.target.value })}
              required
              className="border border-gray-300 rounded-lg px-3 py-2"
            />
            <div className="flex gap-2 md:col-span-2">
              <button type="submit" className="bg-green-500 text-white px-6 py-2 rounded-lg hover:bg-green-600">Save Goal</button>
              <button type="button" onClick={() => setShowForm(false)} className="bg-gray-300 text-gray-700 px-6 py-2 rounded-lg">Cancel</button>
            </div>
          </form>
        </div>
      )}

      {/* Goals List */}
      {loading ? (
        <div className="text-center text-gray-400 py-12">Loading...</div>
      ) : goals.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center text-gray-400 shadow-sm">
          No goals yet. Click "+ Add Goal" to create one.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {goals.map(goal => (
            <div key={goal._id} className="bg-white rounded-2xl p-6 shadow-sm">
              <div className="flex justify-between items-start mb-2">
                <h3 className="text-lg font-semibold text-gray-800">{goal.title}</h3>
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(goal.status)}`}>
                    {goal.status === 'completed' ? '✅ Completed' : goal.status === 'overdue' ? '❌ Overdue' : '🎯 Active'}
                  </span>
                  <button onClick={() => handleDelete(goal._id)} className="text-red-400 hover:text-red-600 text-sm">Delete</button>
                </div>
              </div>

              <p className="text-sm text-gray-500 mb-3">
                ₹{goal.savedAmount.toLocaleString()} saved of ₹{goal.targetAmount.toLocaleString()}
                {goal.status !== 'completed' && (
                  <span className="ml-2 text-gray-400">• {goal.daysLeft > 0 ? `${goal.daysLeft} days left` : 'Deadline passed'}</span>
                )}
              </p>

              {/* Progress Bar */}
              <div className="w-full bg-gray-200 rounded-full h-3 mb-2">
                <div
                  className={`h-3 rounded-full transition-all ${getBarColor(goal.status)}`}
                  style={{ width: `${Math.min(goal.percentage, 100)}%` }}
                />
              </div>
              <p className="text-right text-xs text-gray-500 mb-4">{goal.percentage}% complete</p>

              {/* Deadline */}
              <p className="text-xs text-gray-400 mb-4">
                🗓 Deadline: {new Date(goal.deadline).toLocaleDateString()}
              </p>

              {/* Add Savings */}
              {goal.status !== 'completed' && (
                <div className="flex gap-2">
                  <input
                    type="number"
                    placeholder="Add savings (₹)"
                    value={addAmount[goal._id] || ''}
                    onChange={e => setAddAmount({ ...addAmount, [goal._id]: e.target.value })}
                    className="border border-gray-300 rounded-lg px-3 py-2 flex-1 text-sm"
                  />
                  <button
                    onClick={() => handleAddSavings(goal)}
                    className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 text-sm"
                  >
                    Add
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Goals;
import { useState, useEffect } from 'react';
import axios from '../api/axios';

const Goals = () => {
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [addAmount, setAddAmount] = useState({});
  const [expandedGoal, setExpandedGoal] = useState(null);
  const [form, setForm] = useState({
    title: '', targetAmount: '', savedAmount: '', deadline: ''
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
      await axios.put(`/goals/${goal._id}`, { savedAmount: goal.savedAmount + amount });
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

  const getStatusStyle = (status) => {
    if (status === 'completed') return 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400';
    if (status === 'overdue') return 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400';
    return 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400';
  };

  const getBarColor = (status) => {
    if (status === 'completed') return 'bg-green-500';
    if (status === 'overdue') return 'bg-red-500';
    return 'bg-blue-500';
  };

  const completed = goals.filter(g => g.status === 'completed').length;
  const active = goals.filter(g => g.status === 'active').length;
  const totalTarget = goals.reduce((s, g) => s + g.targetAmount, 0);
  const totalSaved = goals.reduce((s, g) => s + g.savedAmount, 0);

  return (
    <div className="bg-gray-50 dark:bg-gray-950 min-h-screen p-6 transition-colors duration-300">

      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Savings Goals</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Track your financial milestones</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="bg-green-500 text-white px-4 py-2 rounded-xl text-sm hover:bg-green-600 transition"
        >
          + Add Goal
        </button>
      </div>

      {/* Summary Strip */}
      {goals.length > 0 && (
        <div className="grid grid-cols-4 gap-4 mb-6">
          <div className="bg-white dark:bg-gray-900 rounded-2xl p-4 border border-gray-100 dark:border-gray-800 text-center">
            <p className="text-xs text-gray-500 dark:text-gray-400">Total Goals</p>
            <p className="text-2xl font-bold text-gray-800 dark:text-white">{goals.length}</p>
          </div>
          <div className="bg-white dark:bg-gray-900 rounded-2xl p-4 border border-gray-100 dark:border-gray-800 text-center">
            <p className="text-xs text-gray-500 dark:text-gray-400">✅ Completed</p>
            <p className="text-2xl font-bold text-green-500">{completed}</p>
          </div>
          <div className="bg-white dark:bg-gray-900 rounded-2xl p-4 border border-gray-100 dark:border-gray-800 text-center">
            <p className="text-xs text-gray-500 dark:text-gray-400">🎯 Active</p>
            <p className="text-2xl font-bold text-blue-500">{active}</p>
          </div>
          <div className="bg-white dark:bg-gray-900 rounded-2xl p-4 border border-gray-100 dark:border-gray-800 text-center">
            <p className="text-xs text-gray-500 dark:text-gray-400">💰 Total Saved</p>
            <p className="text-lg font-bold text-green-500">₹{totalSaved.toLocaleString()}</p>
            <p className="text-xs text-gray-400">of ₹{totalTarget.toLocaleString()}</p>
          </div>
        </div>
      )}

      {/* Add Form */}
      {showForm && (
        <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-800 mb-6">
          <h2 className="text-base font-semibold text-gray-700 dark:text-gray-300 mb-4">➕ Create New Goal</h2>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input type="text" placeholder="Goal title (e.g. Buy a Laptop)"
              value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} required
              className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-400" />
            <input type="number" placeholder="Target Amount (₹)"
              value={form.targetAmount} onChange={e => setForm({ ...form, targetAmount: e.target.value })} required
              className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-400" />
            <input type="number" placeholder="Already Saved (₹)"
              value={form.savedAmount} onChange={e => setForm({ ...form, savedAmount: e.target.value })}
              className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-400" />
            <input type="date" value={form.deadline}
              onChange={e => setForm({ ...form, deadline: e.target.value })} required
              className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-400" />
            <div className="flex gap-2 md:col-span-2">
              <button type="submit" className="bg-green-500 text-white px-6 py-2 rounded-xl hover:bg-green-600 text-sm transition">Save Goal</button>
              <button type="button" onClick={() => setShowForm(false)} className="bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-6 py-2 rounded-xl text-sm transition">Cancel</button>
            </div>
          </form>
        </div>
      )}

      {/* Goals */}
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500"></div>
        </div>
      ) : goals.length === 0 ? (
        <div className="bg-white dark:bg-gray-900 rounded-2xl p-12 text-center border border-gray-100 dark:border-gray-800">
          <span className="text-4xl">🎯</span>
          <p className="text-gray-400 mt-2 text-sm">No goals yet. Set your first savings goal!</p>
          <button onClick={() => setShowForm(true)} className="mt-4 bg-green-500 text-white px-4 py-2 rounded-xl text-sm hover:bg-green-600 transition">
            Add First Goal
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {goals.map(goal => (
            <div key={goal._id} className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden hover:shadow-md transition">

              {/* Goal Header */}
              <div
                className="p-6 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition"
                onClick={() => setExpandedGoal(expandedGoal === goal._id ? null : goal._id)}
              >
                <div className="flex justify-between items-start mb-3">
                  <h3 className="text-base font-semibold text-gray-800 dark:text-white">{goal.title}</h3>
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-1 rounded-lg text-xs font-semibold ${getStatusStyle(goal.status)}`}>
                      {goal.status === 'completed' ? '✅ Completed' : goal.status === 'overdue' ? '❌ Overdue' : '🎯 Active'}
                    </span>
                    <button onClick={e => { e.stopPropagation(); handleDelete(goal._id); }}
                      className="text-red-400 hover:text-red-600 text-sm transition">✕</button>
                    <span className="text-gray-400 text-xs">{expandedGoal === goal._id ? '▲' : '▼'}</span>
                  </div>
                </div>

                <div className="flex justify-between text-sm text-gray-500 dark:text-gray-400 mb-3">
                  <span>₹{goal.savedAmount.toLocaleString()} saved</span>
                  <span>₹{goal.targetAmount.toLocaleString()} target</span>
                </div>

                <div className="w-full bg-gray-100 dark:bg-gray-800 rounded-full h-2.5 mb-2">
                  <div
                    className={`h-2.5 rounded-full transition-all duration-500 ${getBarColor(goal.status)}`}
                    style={{ width: `${Math.min(goal.percentage, 100)}%` }}
                  />
                </div>
                <div className="flex justify-between text-xs text-gray-400 dark:text-gray-500">
                  <span>🗓 {new Date(goal.deadline).toLocaleDateString()}</span>
                  <span>{goal.percentage}% • {goal.status !== 'completed' && goal.daysLeft > 0 ? `${goal.daysLeft} days left` : goal.status === 'completed' ? 'Done!' : 'Overdue'}</span>
                </div>
              </div>

              {/* Expanded Section */}
              {expandedGoal === goal._id && (
                <div className="border-t border-gray-100 dark:border-gray-800 px-6 pb-6">
                  {/* Mini Summary */}
                  <div className="grid grid-cols-3 gap-3 mt-4 mb-4">
                    <div className="bg-green-50 dark:bg-green-900/20 rounded-xl p-3 text-center">
                      <p className="text-xs text-gray-500 dark:text-gray-400">Saved</p>
                      <p className="text-sm font-bold text-green-600 dark:text-green-400">₹{goal.savedAmount.toLocaleString()}</p>
                    </div>
                    <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-3 text-center">
                      <p className="text-xs text-gray-500 dark:text-gray-400">Target</p>
                      <p className="text-sm font-bold text-blue-600 dark:text-blue-400">₹{goal.targetAmount.toLocaleString()}</p>
                    </div>
                    <div className="bg-orange-50 dark:bg-orange-900/20 rounded-xl p-3 text-center">
                      <p className="text-xs text-gray-500 dark:text-gray-400">Remaining</p>
                      <p className="text-sm font-bold text-orange-600 dark:text-orange-400">
                        ₹{Math.max(0, goal.targetAmount - goal.savedAmount).toLocaleString()}
                      </p>
                    </div>
                  </div>

                  {/* Savings History */}
                  {goal.savingsHistory && goal.savingsHistory.length > 0 && (
                    <div className="mb-4">
                      <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">📅 Savings History</h4>
                      <div className="border border-gray-100 dark:border-gray-700 rounded-xl overflow-hidden">
                        <table className="w-full">
                          <thead className="bg-gray-50 dark:bg-gray-800">
                            <tr>
                              <th className="px-4 py-2 text-left text-xs text-gray-500 dark:text-gray-400">Date</th>
                              <th className="px-4 py-2 text-right text-xs text-gray-500 dark:text-gray-400">Amount</th>
                              <th className="px-4 py-2 text-left text-xs text-gray-500 dark:text-gray-400">Note</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
                            {goal.savingsHistory.map((h, i) => (
                              <tr key={i} className="hover:bg-gray-50 dark:hover:bg-gray-800 transition">
                                <td className="px-4 py-2 text-xs text-gray-600 dark:text-gray-400">
                                  {new Date(h.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                                </td>
                                <td className="px-4 py-2 text-right text-xs font-semibold text-green-500">+₹{h.amount.toLocaleString()}</td>
                                <td className="px-4 py-2 text-xs text-gray-400">{h.note || '—'}</td>
                              </tr>
                            ))}
                          </tbody>
                          <tfoot className="bg-green-50 dark:bg-green-900/20">
                            <tr>
                              <td className="px-4 py-2 text-xs font-bold text-gray-700 dark:text-gray-300">Total</td>
                              <td className="px-4 py-2 text-right text-xs font-bold text-green-500">₹{goal.savedAmount.toLocaleString()}</td>
                              <td></td>
                            </tr>
                          </tfoot>
                        </table>
                      </div>
                    </div>
                  )}

                  {/* Add Savings */}
                  {goal.status !== 'completed' && (
                    <div className="flex gap-2">
                      <input
                        type="number"
                        placeholder="Add savings (₹)"
                        value={addAmount[goal._id] || ''}
                        onChange={e => setAddAmount({ ...addAmount, [goal._id]: e.target.value })}
                        className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-xl px-3 py-2 flex-1 text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
                      />
                      <button
                        onClick={() => handleAddSavings(goal)}
                        className="bg-blue-500 text-white px-4 py-2 rounded-xl hover:bg-blue-600 text-sm transition"
                      >
                        Add
                      </button>
                    </div>
                  )}
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
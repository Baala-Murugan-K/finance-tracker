import { useState, useEffect } from 'react';
import axios from '../api/axios';

const CATEGORIES = ['Food', 'Transport', 'Rent', 'Shopping', 'Health', 'Education', 'Entertainment', 'Other'];

const Budget = () => {
  const [budgets, setBudgets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    category: 'Food',
    limitAmount: '',
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear()
  });

  const fetchBudgets = async () => {
    try {
      const res = await axios.get(`/budget?month=${new Date().getMonth() + 1}&year=${new Date().getFullYear()}`);
      setBudgets(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchBudgets(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/budget', form);
      setShowForm(false);
      setForm({ category: 'Food', limitAmount: '', month: new Date().getMonth() + 1, year: new Date().getFullYear() });
      fetchBudgets();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this budget?')) return;
    await axios.delete(`/budget/${id}`);
    fetchBudgets();
  };

  const getBarColor = (status) => {
    if (status === 'exceeded') return 'bg-red-500';
    if (status === 'warning') return 'bg-yellow-400';
    return 'bg-green-500';
  };

  const getStatusBadge = (status) => {
    if (status === 'exceeded') return 'bg-red-100 text-red-700';
    if (status === 'warning') return 'bg-yellow-100 text-yellow-700';
    return 'bg-green-100 text-green-700';
  };

  return (
    <div className="bg-gray-100 min-h-screen p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Budget Tracker</h1>
        <button
          onClick={() => setShowForm(true)}
          className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600"
        >
          + Set Budget
        </button>
      </div>

      {/* Add Form */}
      {showForm && (
        <div className="bg-white rounded-2xl p-6 shadow-sm mb-6">
          <h2 className="text-lg font-semibold text-gray-700 mb-4">Set Monthly Budget</h2>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <select
              name="category"
              value={form.category}
              onChange={e => setForm({ ...form, category: e.target.value })}
              className="border border-gray-300 rounded-lg px-3 py-2"
            >
              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <input
              type="number"
              placeholder="Limit Amount (₹)"
              value={form.limitAmount}
              onChange={e => setForm({ ...form, limitAmount: e.target.value })}
              required
              className="border border-gray-300 rounded-lg px-3 py-2"
            />
            <select
              value={form.month}
              onChange={e => setForm({ ...form, month: e.target.value })}
              className="border border-gray-300 rounded-lg px-3 py-2"
            >
              {['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'].map((m, i) => (
                <option key={i} value={i + 1}>{m}</option>
              ))}
            </select>
            <div className="flex gap-2">
              <button type="submit" className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 flex-1">Save</button>
              <button type="button" onClick={() => setShowForm(false)} className="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg flex-1">Cancel</button>
            </div>
          </form>
        </div>
      )}

      {/* Budget Cards */}
      {loading ? (
        <div className="text-center text-gray-400 py-12">Loading...</div>
      ) : budgets.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center text-gray-400 shadow-sm">
          No budgets set for this month. Click "Set Budget" to get started.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {budgets.map(budget => (
            <div key={budget._id} className="bg-white rounded-2xl p-6 shadow-sm">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 className="text-lg font-semibold text-gray-800">{budget.category}</h3>
                  <p className="text-sm text-gray-500">₹{budget.spent} / ₹{budget.limitAmount}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadge(budget.status)}`}>
                    {budget.status === 'exceeded' ? '🚨 Exceeded' : budget.status === 'warning' ? '⚠️ Warning' : '✅ Safe'}
                  </span>
                  <button onClick={() => handleDelete(budget._id)} className="text-red-400 hover:text-red-600 text-sm">Delete</button>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className={`h-3 rounded-full transition-all ${getBarColor(budget.status)}`}
                  style={{ width: `${Math.min(budget.percentage, 100)}%` }}
                />
              </div>
              <p className="text-right text-xs text-gray-500 mt-1">{budget.percentage}% used</p>

              {budget.status === 'exceeded' && (
                <div className="mt-3 bg-red-50 border border-red-200 rounded-lg px-3 py-2 text-sm text-red-600">
                  🚨 You have exceeded your {budget.category} budget by ₹{budget.spent - budget.limitAmount}
                </div>
              )}
              {budget.status === 'warning' && (
                <div className="mt-3 bg-yellow-50 border border-yellow-200 rounded-lg px-3 py-2 text-sm text-yellow-600">
                  ⚠️ You have used {budget.percentage}% of your {budget.category} budget
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Budget;
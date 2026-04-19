import { useState, useEffect } from 'react';
import axios from '../api/axios';

const CATEGORIES = ['Food', 'Transport', 'Rent', 'Shopping', 'Health', 'Education', 'Entertainment', 'Other'];
const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

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

  const getStatusStyle = (status) => {
    if (status === 'exceeded') return 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400';
    if (status === 'warning') return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400';
    return 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400';
  };

  const exceeded = budgets.filter(b => b.status === 'exceeded').length;
  const warning = budgets.filter(b => b.status === 'warning').length;
  const safe = budgets.filter(b => b.status === 'safe').length;

  return (
    <div className="bg-gray-50 dark:bg-gray-950 min-h-screen p-6 transition-colors duration-300">

      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Budget Tracker</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Set and monitor your monthly spending limits</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="bg-green-500 text-white px-4 py-2 rounded-xl text-sm hover:bg-green-600 transition"
        >
          + Set Budget
        </button>
      </div>

      {/* Summary Strip */}
      {budgets.length > 0 && (
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-white dark:bg-gray-900 rounded-2xl p-4 border border-gray-100 dark:border-gray-800 text-center">
            <p className="text-xs text-gray-500 dark:text-gray-400">🚨 Exceeded</p>
            <p className="text-2xl font-bold text-red-500">{exceeded}</p>
          </div>
          <div className="bg-white dark:bg-gray-900 rounded-2xl p-4 border border-gray-100 dark:border-gray-800 text-center">
            <p className="text-xs text-gray-500 dark:text-gray-400">⚠️ Warning</p>
            <p className="text-2xl font-bold text-yellow-500">{warning}</p>
          </div>
          <div className="bg-white dark:bg-gray-900 rounded-2xl p-4 border border-gray-100 dark:border-gray-800 text-center">
            <p className="text-xs text-gray-500 dark:text-gray-400">✅ Safe</p>
            <p className="text-2xl font-bold text-green-500">{safe}</p>
          </div>
        </div>
      )}

      {/* Add Form */}
      {showForm && (
        <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-800 mb-6">
          <h2 className="text-base font-semibold text-gray-700 dark:text-gray-300 mb-4">➕ Set Monthly Budget</h2>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <select
              value={form.category}
              onChange={e => setForm({ ...form, category: e.target.value })}
              className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-400"
            >
              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <input
              type="number"
              placeholder="Limit Amount (₹)"
              value={form.limitAmount}
              onChange={e => setForm({ ...form, limitAmount: e.target.value })}
              required
              className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-400"
            />
            <select
              value={form.month}
              onChange={e => setForm({ ...form, month: e.target.value })}
              className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-400"
            >
              {MONTHS.map((m, i) => <option key={i} value={i + 1}>{m}</option>)}
            </select>
            <div className="flex gap-2">
              <button type="submit" className="bg-green-500 text-white px-4 py-2 rounded-xl hover:bg-green-600 flex-1 text-sm transition">Save</button>
              <button type="button" onClick={() => setShowForm(false)} className="bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-4 py-2 rounded-xl flex-1 text-sm transition">Cancel</button>
            </div>
          </form>
        </div>
      )}

      {/* Budget Cards */}
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500"></div>
        </div>
      ) : budgets.length === 0 ? (
        <div className="bg-white dark:bg-gray-900 rounded-2xl p-12 text-center border border-gray-100 dark:border-gray-800">
          <span className="text-4xl">💰</span>
          <p className="text-gray-400 mt-2 text-sm">No budgets set for this month.</p>
          <button onClick={() => setShowForm(true)} className="mt-4 bg-green-500 text-white px-4 py-2 rounded-xl text-sm hover:bg-green-600 transition">
            Set Your First Budget
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {budgets.map(budget => (
            <div key={budget._id} className="bg-white dark:bg-gray-900 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-800 hover:shadow-md transition">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 dark:text-white">{budget.category}</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    ₹{budget.spent.toLocaleString()} spent of ₹{budget.limitAmount.toLocaleString()}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-1 rounded-lg text-xs font-semibold ${getStatusStyle(budget.status)}`}>
                    {budget.status === 'exceeded' ? '🚨 Exceeded' : budget.status === 'warning' ? '⚠️ Warning' : '✅ Safe'}
                  </span>
                  <button onClick={() => handleDelete(budget._id)} className="text-red-400 hover:text-red-600 text-sm transition">✕</button>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-gray-100 dark:bg-gray-800 rounded-full h-2.5 mb-2">
                <div
                  className={`h-2.5 rounded-full transition-all duration-500 ${getBarColor(budget.status)}`}
                  style={{ width: `${Math.min(budget.percentage, 100)}%` }}
                />
              </div>
              <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mb-3">
                <span>₹0</span>
                <span>{budget.percentage}% used</span>
                <span>₹{budget.limitAmount.toLocaleString()}</span>
              </div>

              {/* Alert Messages */}
              {budget.status === 'exceeded' && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl px-3 py-2 text-sm text-red-600 dark:text-red-400">
                  🚨 Exceeded by ₹{(budget.spent - budget.limitAmount).toLocaleString()}
                </div>
              )}
              {budget.status === 'warning' && (
                <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-xl px-3 py-2 text-sm text-yellow-600 dark:text-yellow-400">
                  ⚠️ {budget.percentage}% of budget used — slow down!
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
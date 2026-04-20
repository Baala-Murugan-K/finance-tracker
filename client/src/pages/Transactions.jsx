import { useState, useEffect } from 'react';
import axios from '../api/axios';
import exportCSV from '../utils/exportCSV';

const CATEGORIES = ['Food', 'Transport', 'Rent', 'Shopping', 'Health', 'Education', 'Entertainment', 'Salary', 'Freelance', 'Other'];
const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

const Transactions = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [filterMonth, setFilterMonth] = useState(new Date().getMonth() + 1);
  const [filterYear, setFilterYear] = useState(new Date().getFullYear());
  const [form, setForm] = useState({
    type: 'expense', amount: '', category: 'Food', note: '', date: new Date().toISOString().split('T')[0]
  });

  const fetchTransactions = async () => {
    try {
      const res = await axios.get(`/transactions?month=${filterMonth}&year=${filterYear}`);
      setTransactions(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchTransactions(); }, [filterMonth, filterYear]);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editItem) {
        await axios.put(`/transactions/${editItem._id}`, form);
      } else {
        await axios.post('/transactions', form);
      }
      setShowForm(false);
      setEditItem(null);
      setForm({ type: 'expense', amount: '', category: 'Food', note: '', date: new Date().toISOString().split('T')[0] });
      fetchTransactions();
    } catch (err) {
      console.error(err);
    }
  };

  const handleEdit = (tx) => {
    setEditItem(tx);
    setForm({
      type: tx.type, amount: tx.amount, category: tx.category,
      note: tx.note, date: new Date(tx.date).toISOString().split('T')[0]
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this transaction?')) return;
    await axios.delete(`/transactions/${id}`);
    fetchTransactions();
  };

  const totalIncome = transactions.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
  const totalExpense = transactions.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);

  return (
    <div className="bg-gray-50 dark:bg-gray-950 min-h-screen p-6 transition-colors duration-300">

      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Transactions</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Track your income and expenses</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => exportCSV(transactions)}
            className="flex items-center gap-2 bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-300 px-4 py-2 rounded-xl text-sm hover:bg-gray-300 dark:hover:bg-gray-700 transition"
          >
            📥 Export CSV
          </button>
          <button
            onClick={() => { setShowForm(true); setEditItem(null); }}
            className="flex items-center gap-2 bg-green-500 text-white px-4 py-2 rounded-xl text-sm hover:bg-green-600 transition"
          >
            + Add Transaction
          </button>
        </div>
      </div>

      {/* Summary Strip */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-white dark:bg-gray-900 rounded-2xl p-4 border border-gray-100 dark:border-gray-800 text-center">
          <p className="text-xs text-gray-500 dark:text-gray-400">Income</p>
          <p className="text-lg font-bold text-green-500">+₹{totalIncome.toLocaleString()}</p>
        </div>
        <div className="bg-white dark:bg-gray-900 rounded-2xl p-4 border border-gray-100 dark:border-gray-800 text-center">
          <p className="text-xs text-gray-500 dark:text-gray-400">Expense</p>
          <p className="text-lg font-bold text-red-500">-₹{totalExpense.toLocaleString()}</p>
        </div>
        <div className="bg-white dark:bg-gray-900 rounded-2xl p-4 border border-gray-100 dark:border-gray-800 text-center">
          <p className="text-xs text-gray-500 dark:text-gray-400">Net</p>
          <p className={`text-lg font-bold ${totalIncome - totalExpense >= 0 ? 'text-blue-500' : 'text-red-500'}`}>
            ₹{(totalIncome - totalExpense).toLocaleString()}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-3 mb-6">
        <select
          value={filterMonth}
          onChange={e => setFilterMonth(e.target.value)}
          className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
        >
          {MONTHS.map((m, i) => <option key={i} value={i + 1}>{m}</option>)}
        </select>
        <select
          value={filterYear}
          onChange={e => setFilterYear(e.target.value)}
          className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
        >
          {[2024, 2025, 2026].map(y => <option key={y} value={y}>{y}</option>)}
        </select>
      </div>

      {/* Add/Edit Form */}
      {showForm && (
        <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-800 mb-6">
          <h2 className="text-base font-semibold text-gray-700 dark:text-gray-300 mb-4">
            {editItem ? '✏️ Edit Transaction' : '➕ Add Transaction'}
          </h2>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <select name="type" value={form.type} onChange={handleChange}
              className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-400">
              <option value="income">Income</option>
              <option value="expense">Expense</option>
            </select>
            <input type="number" name="amount" value={form.amount} onChange={handleChange}
              placeholder="Amount (₹)" required
              className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-400" />
            <select name="category" value={form.category} onChange={handleChange}
              className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-400">
              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <input type="text" name="note" value={form.note} onChange={handleChange}
              placeholder="Note (optional)"
              className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-400" />
            <input type="date" name="date" value={form.date} onChange={handleChange}
              className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-400" />
            <div className="flex gap-2">
              <button type="submit"
                className="bg-green-500 text-white px-4 py-2 rounded-xl hover:bg-green-600 flex-1 text-sm transition">
                Save
              </button>
              <button type="button" onClick={() => { setShowForm(false); setEditItem(null); }}
                className="bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-4 py-2 rounded-xl hover:bg-gray-300 dark:hover:bg-gray-600 flex-1 text-sm transition">
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Transactions Table */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-gray-400">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500 mx-auto"></div>
          </div>
        ) : transactions.length === 0 ? (
          <div className="p-12 text-center">
            <span className="text-4xl">📭</span>
            <p className="text-gray-400 mt-2 text-sm">No transactions for this month</p>
          </div>
        ) : (
          <div className="overflow-x-auto max-h-[60vh] overflow-y-auto">
            <table className="w-full min-w-max">
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-800 border-b border-gray-100 dark:border-gray-700">
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Date</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Type</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Category</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Note</th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Amount</th>
                <th className="px-6 py-3 text-center text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
              {transactions.map(tx => (
                <tr key={tx._id} className="hover:bg-gray-50 dark:hover:bg-gray-800 transition">
                  <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                    {new Date(tx.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-lg text-xs font-semibold ${
                      tx.type === 'income'
                        ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                        : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
                    }`}>
                      {tx.type === 'income' ? '↑ Income' : '↓ Expense'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300">{tx.category}</td>
                  <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">{tx.note || '—'}</td>
                  <td className={`px-6 py-4 text-right font-bold text-sm ${
                    tx.type === 'income' ? 'text-green-500' : 'text-red-500'
                  }`}>
                    {tx.type === 'income' ? '+' : '-'}₹{tx.amount.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <button onClick={() => handleEdit(tx)}
                      className="text-blue-500 hover:text-blue-700 text-sm mr-3 font-medium">Edit</button>
                    <button onClick={() => handleDelete(tx._id)}
                      className="text-red-500 hover:text-red-700 text-sm font-medium">Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Transactions;
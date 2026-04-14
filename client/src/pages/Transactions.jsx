import { useState, useEffect } from 'react';
import axios from '../api/axios';
import exportCSV from '../utils/exportCSV';

const CATEGORIES = ['Food', 'Transport', 'Rent', 'Shopping', 'Health', 'Education', 'Entertainment', 'Salary', 'Freelance', 'Other'];

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
      type: tx.type,
      amount: tx.amount,
      category: tx.category,
      note: tx.note,
      date: new Date(tx.date).toISOString().split('T')[0]
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this transaction?')) return;
    await axios.delete(`/transactions/${id}`);
    fetchTransactions();
  };

  return (
    <div className="bg-gray-100 min-h-screen p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Transactions</h1>
        <div className="flex gap-2">
          <button
            onClick={() => exportCSV(transactions)}
            className="bg-gray-700 text-white px-4 py-2 rounded-lg hover:bg-gray-800"
          >
            Export CSV
          </button>
          <button
            onClick={() => { setShowForm(true); setEditItem(null); }}
            className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600"
          >
            + Add Transaction
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-4 mb-6">
        <select
          value={filterMonth}
          onChange={e => setFilterMonth(e.target.value)}
          className="border border-gray-300 rounded-lg px-3 py-2 bg-white"
        >
          {['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'].map((m, i) => (
            <option key={i} value={i + 1}>{m}</option>
          ))}
        </select>
        <select
          value={filterYear}
          onChange={e => setFilterYear(e.target.value)}
          className="border border-gray-300 rounded-lg px-3 py-2 bg-white"
        >
          {[2024, 2025, 2026].map(y => <option key={y} value={y}>{y}</option>)}
        </select>
      </div>

      {/* Add/Edit Form */}
      {showForm && (
        <div className="bg-white rounded-2xl p-6 shadow-sm mb-6">
          <h2 className="text-lg font-semibold text-gray-700 mb-4">{editItem ? 'Edit Transaction' : 'Add Transaction'}</h2>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <select name="type" value={form.type} onChange={handleChange} className="border border-gray-300 rounded-lg px-3 py-2">
              <option value="income">Income</option>
              <option value="expense">Expense</option>
            </select>
            <input type="number" name="amount" value={form.amount} onChange={handleChange} placeholder="Amount" required className="border border-gray-300 rounded-lg px-3 py-2" />
            <select name="category" value={form.category} onChange={handleChange} className="border border-gray-300 rounded-lg px-3 py-2">
              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <input type="text" name="note" value={form.note} onChange={handleChange} placeholder="Note (optional)" className="border border-gray-300 rounded-lg px-3 py-2" />
            <input type="date" name="date" value={form.date} onChange={handleChange} className="border border-gray-300 rounded-lg px-3 py-2" />
            <div className="flex gap-2">
              <button type="submit" className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 flex-1">Save</button>
              <button type="button" onClick={() => { setShowForm(false); setEditItem(null); }} className="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400 flex-1">Cancel</button>
            </div>
          </form>
        </div>
      )}

      {/* Transactions List */}
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-400">Loading...</div>
        ) : transactions.length === 0 ? (
          <div className="p-8 text-center text-gray-400">No transactions found for this month.</div>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-50 text-gray-600 text-sm">
              <tr>
                <th className="px-6 py-3 text-left">Date</th>
                <th className="px-6 py-3 text-left">Type</th>
                <th className="px-6 py-3 text-left">Category</th>
                <th className="px-6 py-3 text-left">Note</th>
                <th className="px-6 py-3 text-right">Amount</th>
                <th className="px-6 py-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {transactions.map(tx => (
                <tr key={tx._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm text-gray-600">{new Date(tx.date).toLocaleDateString()}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${tx.type === 'income' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                      {tx.type}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-700">{tx.category}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">{tx.note || '-'}</td>
                  <td className={`px-6 py-4 text-right font-semibold ${tx.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                    {tx.type === 'income' ? '+' : '-'}₹{tx.amount.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <button onClick={() => handleEdit(tx)} className="text-blue-500 hover:text-blue-700 mr-3 text-sm">Edit</button>
                    <button onClick={() => handleDelete(tx._id)} className="text-red-500 hover:text-red-700 text-sm">Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default Transactions;
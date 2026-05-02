import { useState, useEffect } from 'react';
import axios from '../api/axios';
import { useAuth } from '../context/AuthContext';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  PieChart, Pie, Cell, LineChart, Line, ResponsiveContainer
} from 'recharts';

const COLORS = ['#10b981', '#ef4444', '#f59e0b', '#3b82f6', '#8b5cf6', '#ec4899'];
const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

const StatCard = ({ label, value, color, month, year }) => (
  <div className={`bg-white dark:bg-gray-900 rounded-2xl p-6 shadow-sm border-l-4 ${color} hover:shadow-md transition`}>
    <p className="text-sm text-gray-500 dark:text-gray-400">{label}</p>
    <p className={`text-3xl font-bold mt-1 ${
      color.includes('green') ? 'text-green-500' :
      color.includes('red') ? 'text-red-500' : 'text-blue-500'
    }`}>{value}</p>
    <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">{MONTHS[month-1]} {year}</p>
  </div>
);

const ComparisonCard = ({ label, current, previous, change, color }) => {
  const isPositive = change >= 0;
  const isGood = label === 'Expense' ? !isPositive : isPositive;

  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl p-4 border border-gray-100 dark:border-gray-800">
      <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">{label}</p>
      <p className={`text-xl font-bold ${color}`}>₹{current.toLocaleString()}</p>
      {change !== null ? (
        <div className={`flex items-center gap-1 mt-1 text-xs font-medium ${isGood ? 'text-green-500' : 'text-red-500'}`}>
          <span>{isPositive ? '↑' : '↓'}</span>
          <span>{Math.abs(change)}% vs last month</span>
        </div>
      ) : (
        <p className="text-xs text-gray-400 mt-1">No data last month</p>
      )}
      <p className="text-xs text-gray-400 mt-1">Last month: ₹{previous.toLocaleString()}</p>
    </div>
  );
};

const Dashboard = () => {
  const { user } = useAuth();
  const [summary, setSummary] = useState({ totalIncome: 0, totalExpense: 0, savings: 0 });
  const [insights, setInsights] = useState([]);
  const [monthlyTrend, setMonthlyTrend] = useState([]);
  const [categoryData, setCategoryData] = useState([]);
  const [comparison, setComparison] = useState(null);
  const [loading, setLoading] = useState(true);
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [summaryRes, insightRes, txRes] = await Promise.all([
          axios.get(`/transactions/summary?month=${month}&year=${year}`),
          axios.get('/insights'),
          axios.get(`/transactions?month=${month}&year=${year}`)
        ]);
        setSummary(summaryRes.data);
        setInsights(insightRes.data.insights);
        setMonthlyTrend(insightRes.data.monthlyTrend);
        setComparison(insightRes.data.comparison);
        const expenses = txRes.data.filter(t => t.type === 'expense');
        const categoryMap = {};
        expenses.forEach(t => { categoryMap[t.category] = (categoryMap[t.category] || 0) + t.amount; });
        setCategoryData(Object.entries(categoryMap).map(([name, value]) => ({ name, value })));
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [month, year]);

  if (loading) return (
    <div className="flex justify-center items-center h-screen bg-gray-50 dark:bg-gray-950">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
    </div>
  );

  // Build categoryBreakdown object for AI
  const categoryBreakdown = {};
  categoryData.forEach(({ name, value }) => { categoryBreakdown[name] = value; });

  return (
    <div className="bg-gray-50 dark:bg-gray-950 min-h-screen p-6 transition-colors duration-300">

      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Welcome back, {user?.name} 👋</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Here's your financial overview</p>
        </div>
        <div className="flex gap-2">
          <select
            value={month}
            onChange={e => setMonth(Number(e.target.value))}
            className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
          >
            {MONTHS.map((m, i) => <option key={i} value={i + 1}>{m}</option>)}
          </select>
          <select
            value={year}
            onChange={e => setYear(Number(e.target.value))}
            className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
          >
            {[2024, 2025, 2026].map(y => <option key={y} value={y}>{y}</option>)}
          </select>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <StatCard label="Total Income" value={`₹${summary.totalIncome.toLocaleString()}`} color="border-green-400" month={month} year={year} />
        <StatCard label="Total Expense" value={`₹${summary.totalExpense.toLocaleString()}`} color="border-red-400" month={month} year={year} />
        <StatCard label="Savings" value={`₹${summary.savings.toLocaleString()}`} color="border-blue-400" month={month} year={year} />
      </div>

      {/* Month over Month Comparison */}
      {comparison && (
        <div className="mb-8">
          <h2 className="text-base font-semibold text-gray-700 dark:text-gray-300 mb-3">📊 vs Last Month</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <ComparisonCard label="Income" current={comparison.income.current} previous={comparison.income.previous} change={comparison.income.change} color="text-green-500" />
            <ComparisonCard label="Expense" current={comparison.expense.current} previous={comparison.expense.previous} change={comparison.expense.change} color="text-red-500" />
            <ComparisonCard label="Savings" current={comparison.savings.current} previous={comparison.savings.previous} change={comparison.savings.change} color="text-blue-500" />
          </div>
        </div>
      )}

      {/* Bar + Pie Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-800">
          <h2 className="text-base font-semibold text-gray-700 dark:text-gray-300 mb-4">📊 Monthly Trend (Last 6 Months)</h2>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={monthlyTrend}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="month" tick={{ fill: '#9ca3af', fontSize: 12 }} />
              <YAxis tick={{ fill: '#9ca3af', fontSize: 12 }} />
              <Tooltip
                contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '8px', color: '#f9fafb' }}
                formatter={(value) => `₹${value.toLocaleString()}`}
              />
              <Legend />
              <Bar dataKey="income" fill="#10b981" name="Income" radius={[4,4,0,0]} />
              <Bar dataKey="expense" fill="#ef4444" name="Expense" radius={[4,4,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-800">
          <h2 className="text-base font-semibold text-gray-700 dark:text-gray-300 mb-4">🥧 Expense Breakdown — {MONTHS[month-1]} {year}</h2>
          {categoryData.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-48 text-gray-400">
              <span className="text-4xl mb-2">📭</span>
              <p className="text-sm">No expense data for this month</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie data={categoryData} cx="50%" cy="50%" outerRadius={90} dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  labelLine={false}
                >
                  {categoryData.map((_, index) => (
                    <Cell key={index} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '8px', color: '#f9fafb' }}
                  formatter={(value) => `₹${value.toLocaleString()}`}
                />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Savings Trend Line Chart */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-800 mb-8">
        <h2 className="text-base font-semibold text-gray-700 dark:text-gray-300 mb-4">📈 Savings Trend (Last 6 Months)</h2>
        <ResponsiveContainer width="100%" height={250}>
          <LineChart data={monthlyTrend}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis dataKey="month" tick={{ fill: '#9ca3af', fontSize: 12 }} />
            <YAxis tick={{ fill: '#9ca3af', fontSize: 12 }} />
            <Tooltip
              contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '8px', color: '#f9fafb' }}
              formatter={(value) => `₹${value.toLocaleString()}`}
            />
            <Legend />
            <Line type="monotone" dataKey="income" stroke="#10b981" strokeWidth={2} dot={{ fill: '#10b981' }} name="Income" />
            <Line type="monotone" dataKey="expense" stroke="#ef4444" strokeWidth={2} dot={{ fill: '#ef4444' }} name="Expense" />
            <Line type="monotone" dataKey="savings" stroke="#3b82f6" strokeWidth={2} dot={{ fill: '#3b82f6' }} name="Savings" strokeDasharray="5 5" />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Insights */}
      {insights.length > 0 && (
        <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-800 mb-8">
          <h2 className="text-base font-semibold text-gray-700 dark:text-gray-300 mb-4">💡 Financial Insights</h2>
          <div className="space-y-3">
            {insights.map((insight, i) => (
              <div key={i} className={`px-4 py-3 rounded-xl text-sm font-medium flex items-start gap-3 ${
                insight.type === 'warning' ? 'bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400 border border-yellow-200 dark:border-yellow-800' :
                insight.type === 'success' ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-800' :
                'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-800'
              }`}>
                <span>{insight.type === 'warning' ? '⚠️' : insight.type === 'success' ? '✅' : 'ℹ️'}</span>
                <span>{insight.message}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
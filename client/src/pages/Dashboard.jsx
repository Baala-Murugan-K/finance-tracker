import { useState, useEffect } from 'react';
import axios from '../api/axios';
import { useAuth } from '../context/AuthContext';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  PieChart, Pie, Cell, ResponsiveContainer
} from 'recharts';

const COLORS = ['#10b981', '#ef4444', '#f59e0b', '#3b82f6', '#8b5cf6', '#ec4899'];

const Dashboard = () => {
  const { user } = useAuth();
  const [summary, setSummary] = useState({ totalIncome: 0, totalExpense: 0, savings: 0 });
  const [insights, setInsights] = useState([]);
  const [monthlyTrend, setMonthlyTrend] = useState([]);
  const [categoryData, setCategoryData] = useState([]);
  const [loading, setLoading] = useState(true);

  const currentMonth = new Date().getMonth() + 1;
  const currentYear = new Date().getFullYear();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [summaryRes, insightRes, txRes] = await Promise.all([
          axios.get(`/transactions/summary?month=${currentMonth}&year=${currentYear}`),
          axios.get('/insights'),
          axios.get(`/transactions?month=${currentMonth}&year=${currentYear}`)
        ]);

        setSummary(summaryRes.data);
        setInsights(insightRes.data.insights);
        setMonthlyTrend(insightRes.data.monthlyTrend);

        // Category breakdown for pie chart
        const expenses = txRes.data.filter(t => t.type === 'expense');
        const categoryMap = {};
        expenses.forEach(t => {
          categoryMap[t.category] = (categoryMap[t.category] || 0) + t.amount;
        });
        setCategoryData(Object.entries(categoryMap).map(([name, value]) => ({ name, value })));
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <div className="flex justify-center items-center h-screen text-gray-500">Loading...</div>;

  return (
    <div className="bg-gray-100 min-h-screen p-6">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Welcome back, {user?.name} 👋</h1>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-white rounded-2xl p-6 shadow-sm border-l-4 border-green-400">
          <p className="text-sm text-gray-500">Total Income</p>
          <p className="text-3xl font-bold text-green-500">₹{summary.totalIncome.toLocaleString()}</p>
        </div>
        <div className="bg-white rounded-2xl p-6 shadow-sm border-l-4 border-red-400">
          <p className="text-sm text-gray-500">Total Expense</p>
          <p className="text-3xl font-bold text-red-500">₹{summary.totalExpense.toLocaleString()}</p>
        </div>
        <div className="bg-white rounded-2xl p-6 shadow-sm border-l-4 border-blue-400">
          <p className="text-sm text-gray-500">Savings</p>
          <p className={`text-3xl font-bold ${summary.savings >= 0 ? 'text-blue-500' : 'text-red-500'}`}>
            ₹{summary.savings.toLocaleString()}
          </p>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* Bar Chart */}
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-700 mb-4">Monthly Trend (Last 6 Months)</h2>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={monthlyTrend}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="income" fill="#10b981" name="Income" />
              <Bar dataKey="expense" fill="#ef4444" name="Expense" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Pie Chart */}
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-700 mb-4">Expense Breakdown</h2>
          {categoryData.length === 0 ? (
            <div className="flex items-center justify-center h-48 text-gray-400">No expense data yet</div>
          ) : (
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie data={categoryData} cx="50%" cy="50%" outerRadius={80} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                  {categoryData.map((_, index) => (
                    <Cell key={index} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => `₹${value}`} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Insights */}
      {insights.length > 0 && (
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-700 mb-4">💡 Financial Insights</h2>
          <div className="space-y-3">
            {insights.map((insight, i) => (
              <div key={i} className={`px-4 py-3 rounded-lg text-sm font-medium ${
                insight.type === 'warning' ? 'bg-yellow-50 text-yellow-700 border border-yellow-200' :
                insight.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' :
                'bg-blue-50 text-blue-700 border border-blue-200'
              }`}>
                {insight.type === 'warning' ? '⚠️' : insight.type === 'success' ? '✅' : 'ℹ️'} {insight.message}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
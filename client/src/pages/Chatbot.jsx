import { useState, useEffect, useRef } from 'react';
import axios from '../api/axios';

const AI_URL = import.meta.env.VITE_AI_URL || 'http://localhost:5001';
const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

const Chatbot = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [financeData, setFinanceData] = useState({});
  const [anomalies, setAnomalies] = useState([]);
  const [dataLoading, setDataLoading] = useState(true);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    const fetchFinanceData = async () => {
      try {
        const now = new Date();
        const currentMonth = now.getMonth() + 1;
        const currentYear = now.getFullYear();
        const prevMonth = currentMonth === 1 ? 12 : currentMonth - 1;
        const prevYear = currentMonth === 1 ? currentYear - 1 : currentYear;

        const [currSummary, prevSummary, currTx, prevTx] = await Promise.all([
          axios.get(`/transactions/summary?month=${currentMonth}&year=${currentYear}`),
          axios.get(`/transactions/summary?month=${prevMonth}&year=${prevYear}`),
          axios.get(`/transactions?month=${currentMonth}&year=${currentYear}`),
          axios.get(`/transactions?month=${prevMonth}&year=${prevYear}`)
        ]);

        // Category maps
        const categoryMap = {};
        currTx.data.filter(t => t.type === 'expense').forEach(t => {
          categoryMap[t.category] = (categoryMap[t.category] || 0) + t.amount;
        });

        const prevCategoryMap = {};
        prevTx.data.filter(t => t.type === 'expense').forEach(t => {
          prevCategoryMap[t.category] = (prevCategoryMap[t.category] || 0) + t.amount;
        });

        // Detect anomalies
        const detected = [];
        Object.entries(categoryMap).forEach(([category, amount]) => {
          const prevAmount = prevCategoryMap[category] || 0;
          if (prevAmount > 0) {
            const change = Math.round(((amount - prevAmount) / prevAmount) * 100);
            if (change >= 50) {
              detected.push({
                type: 'spike',
                category,
                current: amount,
                previous: prevAmount,
                change
              });
            }
          } else if (amount > 0) {
            detected.push({
              type: 'new',
              category,
              current: amount
            });
          }
        });

        // Savings drop
        const currSavings = currSummary.data.savings;
        const prevSavings = prevSummary.data.savings;
        if (prevSavings > 0 && currSavings < prevSavings * 0.7) {
          detected.push({
            type: 'savings_drop',
            current: currSavings,
            previous: prevSavings,
            change: Math.round(((currSavings - prevSavings) / prevSavings) * 100)
          });
        }

        setAnomalies(detected);

        const data = {
          income: currSummary.data.totalIncome,
          expenses: currSummary.data.totalExpense,
          savings: currSummary.data.savings,
          savingsRate: currSummary.data.totalIncome > 0
            ? Math.round((currSummary.data.savings / currSummary.data.totalIncome) * 100) : 0,
          categories: categoryMap,
          month: `${MONTHS[currentMonth - 1]} ${currentYear}`,
          previousMonth: {
            month: `${MONTHS[prevMonth - 1]} ${prevYear}`,
            income: prevSummary.data.totalIncome,
            expenses: prevSummary.data.totalExpense,
            savings: prevSummary.data.savings,
            categories: prevCategoryMap
          }
        };

        setFinanceData(data);

        // Build greeting with anomalies
        let greeting = "Hi! I'm FinBot 🤖 your personal finance coach. I can see your current and previous month financial data.";
        if (detected.length > 0) {
          greeting += "\n\n⚠️ I noticed some things about your spending:";
          detected.forEach(a => {
            if (a.type === 'spike') {
              greeting += `\n• Your ${a.category} spending (₹${a.current.toLocaleString()}) is ${a.change}% higher than last month (₹${a.previous.toLocaleString()})`;
            } else if (a.type === 'new') {
              greeting += `\n• New spending detected in ${a.category} this month: ₹${a.current.toLocaleString()}`;
            } else if (a.type === 'savings_drop') {
              greeting += `\n• Your savings dropped ${Math.abs(a.change)}% compared to last month (₹${a.previous.toLocaleString()} → ₹${a.current.toLocaleString()})`;
            }
          });
          greeting += "\n\nWould you like advice on any of these?";
        } else {
          greeting += " What would you like to know?";
        }

        setMessages([{ role: 'assistant', content: greeting }]);
      } catch (err) {
        console.error(err);
        setMessages([{ role: 'assistant', content: "Hi! I'm FinBot 🤖 your personal finance coach. What would you like to know?" }]);
      } finally {
        setDataLoading(false);
      }
    };

    fetchFinanceData();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim() || loading) return;

    const userMsg = { role: 'user', content: input };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput('');
    setLoading(true);

    try {
      const res = await fetch(`${AI_URL}/ai-advice`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: input,
          financeData,
          history: messages.slice(1)
        })
      });

      const data = await res.json();
      setMessages([...newMessages, { role: 'assistant', content: data.advice }]);
    } catch (err) {
      setMessages([...newMessages, {
        role: 'assistant',
        content: 'Sorry, I could not connect to the AI service. Please try again.'
      }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKey = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const suggestions = [
    "How can I save more this month?",
    "Which category am I overspending in?",
    "Compare my spending with last month",
    "Give me a budget plan based on my data"
  ];

  if (dataLoading) return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex flex-col items-center justify-center">
      <span className="text-5xl mb-4 animate-bounce">🤖</span>
      <p className="text-gray-500 dark:text-gray-400 text-sm">Analyzing your financial data...</p>
    </div>
  );

  return (
    <div className="bg-gray-50 dark:bg-gray-950 min-h-screen p-4 md:p-6 transition-colors duration-300">
      <div className="max-w-3xl mx-auto">

        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">🤖 FinBot AI</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Your personal finance coach — powered by Groq AI</p>
        </div>

        {/* Anomaly Alerts */}
        {anomalies.length > 0 && (
          <div className="mb-4 space-y-2">
            {anomalies.map((a, i) => (
              <div key={i} className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-xl px-4 py-3 flex items-start gap-2">
                <span className="text-yellow-500 text-sm">⚠️</span>
                <p className="text-xs text-yellow-700 dark:text-yellow-400">
                  {a.type === 'spike' && `${a.category} spending is ${a.change}% higher than last month (₹${a.previous.toLocaleString()} → ₹${a.current.toLocaleString()})`}
                  {a.type === 'new' && `New spending in ${a.category} this month: ₹${a.current.toLocaleString()}`}
                  {a.type === 'savings_drop' && `Savings dropped ${Math.abs(a.change)}% vs last month (₹${a.previous.toLocaleString()} → ₹${a.current.toLocaleString()})`}
                </p>
              </div>
            ))}
          </div>
        )}

        {/* Finance Context Card */}
        {financeData.income !== undefined && (
          <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-2xl p-4 mb-4">
            <p className="text-xs font-semibold text-green-700 dark:text-green-400 mb-3">
              📊 FinBot can see your financial data:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="bg-white dark:bg-gray-800 rounded-xl p-3">
                <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-2">{financeData.month} (Current)</p>
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Income</p>
                    <p className="text-sm font-bold text-green-600">₹{financeData.income?.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Expense</p>
                    <p className="text-sm font-bold text-red-500">₹{financeData.expenses?.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Savings</p>
                    <p className="text-sm font-bold text-blue-500">₹{financeData.savings?.toLocaleString()}</p>
                  </div>
                </div>
              </div>
              {financeData.previousMonth && (
                <div className="bg-white dark:bg-gray-800 rounded-xl p-3">
                  <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-2">{financeData.previousMonth.month} (Previous)</p>
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Income</p>
                      <p className="text-sm font-bold text-green-600">₹{financeData.previousMonth.income?.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Expense</p>
                      <p className="text-sm font-bold text-red-500">₹{financeData.previousMonth.expenses?.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Savings</p>
                      <p className="text-sm font-bold text-blue-500">₹{financeData.previousMonth.savings?.toLocaleString()}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Chat Window */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden">
          <div className="h-96 overflow-y-auto p-4 space-y-4">
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`flex items-start gap-2 max-w-[85%] ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm flex-shrink-0 ${
                    msg.role === 'user' ? 'bg-green-500' : 'bg-blue-500'
                  }`}>
                    {msg.role === 'user' ? '👤' : '🤖'}
                  </div>
                  <div className={`px-4 py-3 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap ${
                    msg.role === 'user'
                      ? 'bg-green-500 text-white rounded-tr-none'
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 rounded-tl-none'
                  }`}>
                    {msg.content}
                  </div>
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex justify-start">
                <div className="flex items-start gap-2">
                  <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-sm">🤖</div>
                  <div className="bg-gray-100 dark:bg-gray-800 px-4 py-3 rounded-2xl rounded-tl-none">
                    <div className="flex gap-1 items-center">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Suggestions */}
          {messages.length <= 1 && (
            <div className="px-4 pb-3 flex flex-wrap gap-2">
              {suggestions.map((s, i) => (
                <button key={i} onClick={() => setInput(s)}
                  className="text-xs bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 px-3 py-1.5 rounded-full hover:bg-green-100 dark:hover:bg-green-900/30 hover:text-green-600 dark:hover:text-green-400 transition">
                  {s}
                </button>
              ))}
            </div>
          )}

          {/* Input */}
          <div className="border-t border-gray-100 dark:border-gray-800 p-3 flex gap-2">
            <input
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKey}
              placeholder="Ask FinBot anything about your finances..."
              className="flex-1 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-800 dark:text-white rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-400 transition"
            />
            <button
              onClick={sendMessage}
              disabled={loading || !input.trim()}
              className="bg-green-500 hover:bg-green-600 disabled:opacity-50 text-white px-4 py-2.5 rounded-xl text-sm font-medium transition"
            >
              Send
            </button>
          </div>
        </div>

        <p className="text-xs text-center text-gray-400 mt-3">
          Powered by Groq AI (LLaMA 3.3 70B) • Responses are AI-generated financial guidance
        </p>
      </div>
    </div>
  );
};

export default Chatbot;
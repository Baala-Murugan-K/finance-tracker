import { useState } from "react";

const AI_SERVICE_URL = import.meta.env.VITE_AI_SERVICE_URL || "http://localhost:5001";

export default function AiAdvisor({ financeData }) {
  const [question, setQuestion] = useState("");
  const [messages, setMessages] = useState([
    {
      role: "ai",
      text: "Hi! I'm your AI Finance Advisor. Ask me anything about your spending, savings, or budget.",
    },
  ]);
  const [loading, setLoading] = useState(false);

  const askAdvisor = async () => {
    if (!question.trim()) return;

    const userMsg = { role: "user", text: question };
    setMessages((prev) => [...prev, userMsg]);
    setQuestion("");
    setLoading(true);

    try {
      const res = await fetch(`${AI_SERVICE_URL}/ai-advice`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question, financeData }),
      });

      const data = await res.json();
      const aiMsg = { role: "ai", text: data.advice || "Sorry, couldn't get advice." };
      setMessages((prev) => [...prev, aiMsg]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        { role: "ai", text: "Something went wrong. Try again." },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-md flex flex-col h-96">
      <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
        🤖 AI Finance Advisor
      </h2>

      {/* Chat Window */}
      <div className="flex-1 overflow-y-auto flex flex-col gap-2 mb-3 p-2 bg-gray-50 dark:bg-gray-700 rounded-lg">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`p-2 rounded-lg text-sm max-w-[85%] whitespace-pre-wrap ${
              msg.role === "user"
                ? "bg-blue-500 text-white self-end"
                : "bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-white self-start"
            }`}
          >
            {msg.text}
          </div>
        ))}
        {loading && (
          <div className="bg-gray-200 dark:bg-gray-600 p-2 rounded-lg text-sm self-start animate-pulse">
            Thinking...
          </div>
        )}
      </div>

      {/* Input */}
      <div className="flex gap-2">
        <input
          type="text"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && !loading && askAdvisor()}
          placeholder="Am I overspending on food?"
          className="flex-1 border rounded-lg px-3 py-2 text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          onClick={askAdvisor}
          disabled={loading}
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-sm disabled:opacity-50 transition-colors"
        >
          Ask
        </button>
      </div>
    </div>
  );
}
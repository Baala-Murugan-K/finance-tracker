from flask import Flask, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv
import requests
import os

load_dotenv()

app = Flask(__name__)
CORS(app)

GROQ_API_KEY = os.getenv("GROQ_API_KEY")
GROQ_URL = "https://api.groq.com/openai/v1/chat/completions"

@app.route("/health", methods=["GET"])
def health():
    return jsonify({"status": "AI service running"})

@app.route("/ai-advice", methods=["POST"])
def get_advice():
    try:
        data = request.json
        question = data.get("question", "")
        finance_data = data.get("financeData", {})
        history = data.get("history", [])

        if not question:
            return jsonify({"error": "Question is required"}), 400

        system_prompt = f"""You are FinBot, a friendly and expert personal finance coach and advisor. 
You have access to the user's real financial data and give specific, actionable advice based on their numbers.
Always be encouraging but honest. Use Indian Rupee (₹) for amounts.
Keep responses concise (3-5 sentences max) unless the user asks for detailed explanation.

User's Current Financial Data ({finance_data.get('month', 'Current Month')}):
- Total Income: ₹{finance_data.get('income', 0):,}
- Total Expenses: ₹{finance_data.get('expenses', 0):,}
- Savings: ₹{finance_data.get('savings', 0):,}
- Savings Rate: {finance_data.get('savingsRate', 0)}%
- Category Breakdown: {finance_data.get('categories', {})}

Previous Month Data ({finance_data.get('previousMonth', {}).get('month', 'Last Month')}):
- Income: ₹{finance_data.get('previousMonth', {}).get('income', 0):,}
- Expenses: ₹{finance_data.get('previousMonth', {}).get('expenses', 0):,}
- Savings: ₹{finance_data.get('previousMonth', {}).get('savings', 0):,}
- Category Breakdown: {finance_data.get('previousMonth', {}).get('categories', {})}

Role: You are a personal finance coach. Give specific advice based on their actual numbers.
Never give generic advice — always reference their real data."""

        messages = [{"role": "system", "content": system_prompt}]

        for msg in history[-6:]:
            messages.append({"role": msg["role"], "content": msg["content"]})

        messages.append({"role": "user", "content": question})

        response = requests.post(
            GROQ_URL,
            headers={
                "Authorization": f"Bearer {GROQ_API_KEY}",
                "Content-Type": "application/json"
            },
            json={
                "model": "llama-3.3-70b-versatile",
                "messages": messages,
                "max_tokens": 500,
                "temperature": 0.7
            }
        )

        result = response.json()

        if "choices" not in result:
            return jsonify({"error": "AI service error"}), 500

        advice = result["choices"][0]["message"]["content"]
        return jsonify({"advice": advice})

    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    app.run(debug=True, port=5001)
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

        if not question:
            return jsonify({"error": "Question is required"}), 400

        prompt = f"""
You are a personal finance advisor. Analyze the user's actual financial data and answer their question with specific, practical advice.

User's Financial Data:
- Total Income: ₹{finance_data.get('income', 0)}
- Total Expenses: ₹{finance_data.get('expenses', 0)}
- Savings: ₹{finance_data.get('savings', 0)}
- Category Breakdown: {finance_data.get('categories', {})}
- Month: {finance_data.get('month', 'Current')}

User Question: {question}

Give specific advice based on their actual numbers. Keep it concise and actionable.
        """

        print("API KEY LOADED:", GROQ_API_KEY[:10] if GROQ_API_KEY else "NOT FOUND")

        response = requests.post(
            GROQ_URL,
            headers={
                "Authorization": f"Bearer {GROQ_API_KEY}",
                "Content-Type": "application/json"
            },
            json={
                "model": "llama-3.3-70b-versatile",
                "messages": [{"role": "user", "content": prompt}],
                "max_tokens": 500
            }
        )

        print("STATUS CODE:", response.status_code)
        print("FULL RESPONSE:", response.json())

        result = response.json()

        if "choices" not in result:
            return jsonify({"error": result}), 500

        advice = result["choices"][0]["message"]["content"]
        return jsonify({"advice": advice})

    except Exception as e:
        print("EXCEPTION:", str(e))
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    app.run(debug=True, port=5001)
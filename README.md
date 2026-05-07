# 💰 Personal Finance Dashboard

A full-stack personal finance tracking application built with the MERN stack + AI. Track income, expenses, set budgets, manage savings goals, get automated email alerts, and chat with an AI finance coach — all in one place.

🌐 **Live Demo:** [finance-tracker-gamma-lemon.vercel.app](https://finance-tracker-gamma-lemon.vercel.app)  
📁 **GitHub:** [github.com/Baala-Murugan-K/finance-tracker](https://github.com/Baala-Murugan-K/finance-tracker)

---

## ✨ Features

### 🤖 FinBot — AI Finance Coach
- Powered by **Groq AI (LLaMA 3.3 70B)** via Flask microservice
- Reads your **real financial data** (current + previous month)
- **Proactive spending anomaly detection** — alerts when a category spikes 50%+
- Personalized coaching based on your actual income, expenses, and savings
- Conversation history context for multi-turn chat
- Quick suggestion chips for common finance questions

### 💳 Transaction Management
- Add, edit, delete income and expense transactions
- Filter by month and year
- Export transactions to CSV
- Category-wise tracking (Food, Rent, Transport, Shopping, etc.)

### 📊 Dashboard & Analytics
- Monthly income, expense, and savings summary cards
- **Month-over-month comparison** (↑↓ vs last month with % change)
- Bar chart — monthly income vs expense trend (last 6 months)
- Pie chart — category-wise expense breakdown
- Line chart — 6-month savings trend

### 💰 Budget Tracker
- Set monthly spending limits per category
- Real-time progress bars (Safe ✅ / Warning ⚠️ / Exceeded 🚨)
- Automatic email alert when budget is exceeded (with exact overspend amount)

### 🎯 Savings Goals
- Create savings goals with target amount and deadline
- Add savings incrementally with note support
- Full savings history table per goal
- Progress bar with days remaining
- Automatic goal achievement email with complete savings journey

### 💡 Financial Insights
- Rule-based spending pattern detection
- High spending month alerts (>40% of income)
- Recurring category detection (3+ months)
- Monthly savings rate analysis

### 🔐 Authentication
- JWT-based secure authentication (Bearer token)
- Forgot password via email reset link (15 min expiry)
- Change password from profile page
- Per-user data isolation

### 🌙 UI/UX
- **Dark / Light mode toggle** with localStorage persistence
- Fully responsive — mobile + desktop
- Password visibility toggle on login/register
- Animated loading screens with bounce logo
- Mobile hamburger menu

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React.js, Tailwind CSS, Recharts |
| Backend | Node.js, Express.js |
| AI Service | Python, Flask, Groq API (LLaMA 3.3 70B) |
| Database | MongoDB (Atlas) |
| Auth | JWT, bcryptjs |
| Email | Brevo SMTP, Nodemailer |
| Scheduling | node-cron |
| Deployment | Vercel (frontend), Render (backend + AI service) |

---

## 📁 Project Structure

```
finance-tracker/
├── client/                   # React frontend
│   ├── src/
│   │   ├── api/              # Axios instance with auth interceptor
│   │   ├── components/       # Navbar, PrivateRoute
│   │   ├── context/          # AuthContext, ThemeContext
│   │   ├── pages/            # Dashboard, Transactions, Budget, Goals, Chatbot, Profile
│   │   └── utils/            # CSV export utility
│
├── server/                   # Node.js backend
│   ├── config/               # DB connection
│   ├── controllers/          # Auth, Transaction, Budget, Goal, Insight
│   ├── middleware/           # JWT auth middleware
│   ├── models/               # User, Transaction, Budget, Goal schemas
│   └── routes/               # API routes
│
└── ai-service/               # Python Flask AI microservice
    ├── app.py                # Groq AI chatbot endpoint
    └── requirements.txt
```

---

## 🚀 Getting Started (Local Setup)

### Prerequisites
- Node.js v18+
- Python 3.10+
- MongoDB (local or Atlas)

### 1. Clone the repo
```bash
git clone https://github.com/Baala-Murugan-K/finance-tracker.git
cd finance-tracker
```

### 2. Setup Backend
```bash
cd server
npm install
```

Create `server/.env`:
```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/financeDB
JWT_SECRET=your_jwt_secret
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
SMTP_HOST=smtp-relay.brevo.com
SMTP_PORT=587
SMTP_USER=your_brevo_smtp_user
SMTP_PASS=your_brevo_smtp_key
EMAIL_USER=your_gmail@gmail.com
```

```bash
npm run dev
```

### 3. Setup Frontend
```bash
cd client
npm install
npm run dev
```

### 4. Setup AI Service
```bash
cd ai-service
pip install -r requirements.txt
```

Create `ai-service/.env`:
```env
GROQ_API_KEY=your_groq_api_key
```

```bash
python app.py
```

Open `http://localhost:5173`

---

## 📧 Email Features

| Trigger | Email Sent |
|---|---|
| Budget exceeded | 🚨 Budget alert with limit, spent, exceeded amount and % used |
| Goal achieved | 🏆 Congratulations with full savings journey table |
| Forgot password | 🔐 Password reset link (expires in 15 mins) |
| Daily cron job | Checks all budgets at 8:00 AM every day |

---

## 🤖 FinBot AI — How It Works

```
User opens FinBot →
Backend fetches current + previous month data →
Anomaly detection runs (category spike ≥ 50%) →
FinBot greets with proactive alerts →
User chats with real financial context →
Groq LLaMA 3.3 70B generates personalized advice
```

**Anomaly Types Detected:**
- Category spending spike (≥50% vs last month)
- New category spending detected
- Savings drop (≥30% vs last month)

---

## 🌐 Deployed Services

| Service | Platform | URL |
|---|---|---|
| Frontend | Vercel | [finance-tracker-gamma-lemon.vercel.app](https://finance-tracker-gamma-lemon.vercel.app) |
| Backend API | Render | finance-tracker-c4nb.onrender.com |
| AI Service | Render | finance-ai-service-z1jd.onrender.com |
| Database | MongoDB Atlas | Cloud hosted |

---

## 👨‍💻 Author

**Baala Murugan K**
- GitHub: [@Baala-Murugan-K](https://github.com/Baala-Murugan-K)
- LinkedIn: [linkedin.com/in/baala-murugan-k](https://linkedin.com/in/baala-murugan-k)
- Email: baalamurugan.k25@gmail.com

---

## 📄 License

MIT License — feel free to use this project for learning or portfolio purposes.
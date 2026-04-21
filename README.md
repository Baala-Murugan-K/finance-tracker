# 💰 Personal Finance Dashboard

A full-stack personal finance tracking application built with the MERN stack. Track income, expenses, set budgets, manage savings goals, and get automated email alerts — all in one place.

🌐 **Live Demo:** [finance-tracker-gamma-lemon.vercel.app](https://finance-tracker-gamma-lemon.vercel.app)

---

## ✨ Features

### 💳 Transaction Management
- Add, edit, delete income and expense transactions
- Filter by month and year
- Export transactions to CSV
- Category-wise tracking (Food, Rent, Transport, etc.)

### 📊 Dashboard & Analytics
- Monthly income, expense, and savings summary cards
- Month-over-month comparison (↑↓ vs last month)
- Bar chart — monthly income vs expense trend
- Pie chart — category-wise expense breakdown
- Line chart — 6-month savings trend

### 💰 Budget Tracker
- Set monthly spending limits per category
- Real-time progress bars (Safe / Warning / Exceeded)
- Automatic email alert when budget is exceeded

### 🎯 Savings Goals
- Create savings goals with target amount and deadline
- Add savings incrementally with history tracking
- Progress bar with days remaining
- Automatic goal achievement email with savings journey

### 💡 Financial Insights
- Rule-based spending pattern detection
- High spending month alerts
- Recurring category detection
- Monthly savings rate analysis

### 🔐 Authentication
- JWT-based secure authentication
- Forgot password via email reset link
- Change password from profile
- Per-user data isolation

### 🌙 UI/UX
- Dark / Light mode toggle
- Fully responsive (mobile + desktop)
- Password visibility toggle
- Animated loading screens

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React.js, Tailwind CSS, Recharts |
| Backend | Node.js, Express.js |
| Database | MongoDB (Atlas) |
| Auth | JWT, bcryptjs |
| Email | Brevo SMTP, Nodemailer |
| Scheduling | node-cron |
| Deployment | Vercel (frontend), Render (backend) |

---

## 📁 Project Structure

finance-tracker/
├── client/                 # React frontend
│   ├── src/
│   │   ├── api/            # Axios instance
│   │   ├── components/     # Navbar, PrivateRoute
│   │   ├── context/        # Auth + Theme context
│   │   ├── pages/          # All page components
│   │   └── utils/          # CSV export utility
│
└── server/                 # Node.js backend
├── config/             # DB connection
├── controllers/        # Business logic
├── middleware/         # Auth middleware
├── models/             # Mongoose schemas
└── routes/             # API routes

---

## 🚀 Getting Started (Local Setup)

### Prerequisites
- Node.js v18+
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

Open `http://localhost:5173`

---

## 📧 Email Features

| Trigger | Email Sent |
|---|---|
| Budget exceeded | 🚨 Budget alert with limit, spent, exceeded amount |
| Goal achieved | 🏆 Congratulations with full savings journey table |
| Forgot password | 🔐 Password reset link (expires in 15 mins) |
| Daily cron job | Checks all budgets at 8:00 AM daily |

---

## 📱 Screenshots

### Dashboard (Dark Mode)
> Monthly summary, charts, insights, savings trend

### Transactions
> Add/Edit/Delete with month filter and CSV export

### Budget Tracker
> Category-wise limits with progress bars and alerts

### Savings Goals
> Goal cards with savings history and progress tracking

---

## 👨‍💻 Author

**Baala Murugan K**
- GitHub: [@Baala-Murugan-K](https://github.com/Baala-Murugan-K)
- LinkedIn: [baala-murugan-k](https://linkedin.com/in/baala-murugan-k)
- Email: baalamurugan.k25@gmail.com

---

## 📄 License

MIT License — feel free to use this project for learning or portfolio purposes.
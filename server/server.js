const express = require('express');
const dotenv = require('dotenv');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const cron = require('node-cron');
const connectDB = require('./config/db');

dotenv.config();
connectDB();

const app = express();

app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());
app.use(cookieParser());

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/transactions', require('./routes/transactionRoutes'));
app.use('/api/budget', require('./routes/budgetRoutes'));
app.use('/api/goals', require('./routes/goalRoutes'));
app.use('/api/insights', require('./routes/insightRoutes'));
// Test email alert manually
app.get('/api/test-alert', async (req, res) => {
  await checkAndAlertBudgets();
  res.json({ message: 'Budget check triggered' });
});
app.get('/', (req, res) => {
  res.send('Finance Tracker API Running');
});

// Cron job - runs every day at 8:00 AM
const { checkAndAlertBudgets } = require('./controllers/budgetController');
cron.schedule('0 8 * * *', () => {
  console.log('Running budget alert check...');
  checkAndAlertBudgets();
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
const express = require('express');
const router = express.Router();
const {
  addTransaction,
  getTransactions,
  updateTransaction,
  deleteTransaction,
  getSummary
} = require('../controllers/transactionController');
const protect = require('../middleware/authMiddleware');

router.get('/summary', protect, getSummary);
router.get('/', protect, getTransactions);
router.post('/', protect, addTransaction);
router.put('/:id', protect, updateTransaction);
router.delete('/:id', protect, deleteTransaction);

module.exports = router;
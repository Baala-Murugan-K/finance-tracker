const express = require('express');
const router = express.Router();
const { setBudget, getBudgets, updateBudget, deleteBudget } = require('../controllers/budgetController');
const protect = require('../middleware/authMiddleware');

router.get('/', protect, getBudgets);
router.post('/', protect, setBudget);
router.put('/:id', protect, updateBudget);
router.delete('/:id', protect, deleteBudget);

module.exports = router;
const express = require('express');
const router = express.Router();
const { getLeaderboard, updateGameOver, reviveUser } = require('../controllers/userController');
const { protect } = require('../middleware/auth');

// Public route
router.get('/leaderboard', getLeaderboard);

// Protected routes
router.post('/game-over', protect, updateGameOver);
router.post('/revive', protect, reviveUser);

module.exports = router;

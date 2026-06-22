const User = require('../models/User');
const Leaderboard = require('../models/Leaderboard');
const Inventory = require('../models/Inventory');

// @desc    Get Leaderboard rankings
// @route   GET /api/leaderboard
// @access  Public
const getLeaderboard = async (req, res) => {
  try {
    // Get top 10 by score
    const topScores = await Leaderboard.find()
      .populate('userId', 'name')
      .sort({ score: -1 })
      .limit(10);

    // Get top 10 by wins
    const topWins = await Leaderboard.find()
      .populate('userId', 'name')
      .sort({ wins: -1 })
      .limit(10);

    res.json({
      success: true,
      byScore: topScores.map(item => ({
        name: item.userId ? item.userId.name : 'Unknown Player',
        score: item.score,
        userId: item.userId ? item.userId._id : null
      })),
      byWins: topWins.map(item => ({
        name: item.userId ? item.userId.name : 'Unknown Player',
        wins: item.wins,
        userId: item.userId ? item.userId._id : null
      }))
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Handle game over results and update player assets
// @route   POST /api/user/game-over
// @access  Private
const updateGameOver = async (req, res) => {
  const { score, coinsEarned, diamondsEarned, didWin } = req.body;

  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Award assets
    user.coins += Number(coinsEarned) || 0;
    user.diamonds += Number(diamondsEarned) || 0;

    // Reset single player hearts if they finished the game
    // Wait, the hearts reset to 5 or we just keep track of it.
    // If they hit 0, they must buy revive or reset. Let's set hearts to 5 if they finished the game.
    // Let's check: when game is over (normal exit or death), hearts are reset to 5 so they can play again,
    // unless they die in-game and want to revive *during* the game.
    // Let's implement that: when they are fully dead, hearts are 0. To start a new game, we can reset hearts to 5 or they have to start with 5.
    // Let's say: starting a new game resets their active hearts to 5 (costing nothing), but dying *during* the game allows them to spend 50 coins to revive (keep score and continue). That makes perfect sense!
    if (user.hearts <= 0) {
      user.hearts = 5; // Reset for next game
    }

    if (score && score > user.highestScore) {
      user.highestScore = score;
    }

    if (didWin) {
      user.wins += 1;
    }

    await user.save();

    // Sync Inventory
    const inventory = await Inventory.findOne({ userId: user._id });
    if (inventory) {
      inventory.coins = user.coins;
      inventory.diamonds = user.diamonds;
      await inventory.save();
    }

    // Sync Leaderboard
    const leaderboard = await Leaderboard.findOne({ userId: user._id });
    if (leaderboard) {
      if (user.highestScore > leaderboard.score) {
        leaderboard.score = user.highestScore;
      }
      leaderboard.wins = user.wins;
      leaderboard.updatedAt = Date.now();
      await leaderboard.save();
    }

    res.json({
      success: true,
      message: 'Statistics updated successfully',
      user: {
        coins: user.coins,
        diamonds: user.diamonds,
        highestScore: user.highestScore,
        wins: user.wins,
        hearts: user.hearts
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Spend coins to revive and restore hearts to 5
// @route   POST /api/user/revive
// @access  Private
const reviveUser = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (user.coins < 50) {
      return res.status(400).json({ success: false, message: 'Insufficient coins to revive. Requires 50 coins.' });
    }

    user.coins -= 50;
    user.hearts = 5; // Fully restore hearts
    await user.save();

    // Sync Inventory
    const inventory = await Inventory.findOne({ userId: user._id });
    if (inventory) {
      inventory.coins = user.coins;
      await inventory.save();
    }

    res.json({
      success: true,
      message: 'Player revived successfully!',
      user: {
        coins: user.coins,
        hearts: user.hearts
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

module.exports = {
  getLeaderboard,
  updateGameOver,
  reviveUser
};

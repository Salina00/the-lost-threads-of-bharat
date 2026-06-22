const Question = require('../models/Question');

// @desc    Get random questions
// @route   GET /api/questions/random
// @access  Public
const getRandomQuestions = async (req, res) => {
  const count = parseInt(req.query.count) || 1;

  try {
    const questions = await Question.aggregate([{ $sample: { size: count } }]);
    res.json({
      success: true,
      questions,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

module.exports = {
  getRandomQuestions,
};

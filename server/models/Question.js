const mongoose = require('mongoose');

const QuestionSchema = new mongoose.Schema({
  category: {
    type: String,
    required: true,
    enum: ['musical_instruments', 'monuments', 'literature', 'festivals', 'paintings', 'historical_figures', 'general_heritage'],
  },
  question: {
    type: String,
    required: true,
    trim: true,
  },
  options: {
    type: [String],
    required: true,
    validate: [arrayLimit, '{PATH} must have exactly 4 options'],
  },
  answer: {
    type: String,
    required: true,
    trim: true,
  },
});

function arrayLimit(val) {
  return val.length === 4;
}

module.exports = mongoose.model('Question', QuestionSchema);

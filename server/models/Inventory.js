const mongoose = require('mongoose');

const InventorySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
  },
  skins: {
    type: [String],
    default: ['default'],
  },
  boosters: {
    type: [String], // e.g., 'shield', 'speed'
    default: [],
  },
  coins: {
    type: Number,
    default: 100,
  },
  diamonds: {
    type: Number,
    default: 10,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Inventory', InventorySchema);

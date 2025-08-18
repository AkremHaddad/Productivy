const mongoose = require('mongoose');

const averageSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  category: { type: String, required: true, enum: ['playing', 'working', 'eating', 'resting', 'training', 'learning', 'sleeping', 'other'] },
  average: { type: Number, default: 0 },
  lastUpdated: { type: Date, default: Date.now },
}, { timestamps: true });

// Unique per user-category
averageSchema.index({ userId: 1, category: 1 }, { unique: true });

module.exports = mongoose.model('Average', averageSchema);
// models/WeeklySummary.js
import mongoose from "mongoose";

const weeklySummarySchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    // weekStart is the Monday of the week, in YYYY-MM-DD format
    weekStart: { type: String, required: true },
    // hours: each hour 0-23, value is { working: avgMinutes, learning: avgMinutes, ... }
    hours: {
      type: Map,
      of: Object,
      default: {},
    },
  },
  { timestamps: true }
);

// Ensure one summary per user per week
weeklySummarySchema.index({ user: 1, weekStart: 1 }, { unique: true });

export default mongoose.model("WeeklySummary", weeklySummarySchema);

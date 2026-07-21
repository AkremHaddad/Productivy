// models/CurrentActivity.js
import mongoose from "mongoose";

const currentActivitySchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, unique: true },
  // Collapsed from 8 to 6 categories (design review, Phase 3): merged
  // sleeping + others -> off, hobbying -> playing, to cut choice overload.
  // Old stale values from before this change are handled client-side
  // (Status.jsx normalizes them on read) rather than via a DB migration -
  // they get overwritten the next time the user changes status anyway.
  activity: {
    type: String,
    enum: [
      "working",
      "learning",
      "training",
      "playing",
      "socializing",
      "off",
    ],
    default: "working",
  },
  isOnline: { type: Boolean, default: false },
  lastSeen: { type: Date, default: Date.now },
  // Last time the activityCron actually credited this user with time.
  // Distinct from lastSeen (last client heartbeat ping) — this is what lets
  // the cron compute real elapsed time instead of assuming a flat minute
  // passed every tick. Null until the first tick after coming online.
  lastAccountedAt: { type: Date, default: null },
});

export default mongoose.model("CurrentActivity", currentActivitySchema);

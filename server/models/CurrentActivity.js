// models/CurrentActivity.js
import mongoose from "mongoose";

const currentActivitySchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, unique: true },
  activity: {
    type: String,
    enum: [
      "working",
      "learning",
      "sleeping",
      "training",
      "playing",
      "socializing",
      "hobbying",
      "others",
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

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
});

export default mongoose.model("CurrentActivity", currentActivitySchema);

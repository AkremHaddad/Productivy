// A lightweight event log powering the dashboard's "Today's recap".
// Written best-effort from project/activity actions — never allowed to
// block or fail the action that triggered it (see callers).
import mongoose from "mongoose";

const eventSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  project: { type: mongoose.Schema.Types.ObjectId, ref: "Project" },
  type: {
    type: String,
    enum: ["task_completed", "card_completed", "card_moved", "sprint_started", "session_ended"],
    required: true,
  },
  message: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

eventSchema.index({ user: 1, createdAt: -1 });

export default mongoose.model("Event", eventSchema);

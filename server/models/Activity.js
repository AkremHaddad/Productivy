import mongoose from "mongoose";

const activitySchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  day: { type: String, required: true }, // YYYY-MM-DD
  hours: {
    type: Map,
    of: Object, // { working: 0, learning: 0, ... }
    default: {},
  },
}, { timestamps: true });

activitySchema.index({ user: 1, day: 1 }, { unique: true });

export default mongoose.model("Activity", activitySchema);

import mongoose from "mongoose";

const activitySessionSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  activity: {
    type: String,
    enum: [
      "working", "learning", "sleeping", "training", "playing",
      "socializing", "hobbying", "others"
    ],
    required: true,
  },
  startTime: { type: Date, required: true },
  endTime: { type: Date, required: true },
}, { timestamps: true });

activitySessionSchema.index({ user: 1, startTime: 1 });

export default mongoose.model("ActivitySession", activitySessionSchema);

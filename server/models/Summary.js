import mongoose from "mongoose";

const intervalSchema = new mongoose.Schema(
  {
    start: { type: String, required: true }, // "HH:mm"
    end: { type: String, required: true },   // "HH:mm"
  },
  { _id: false }
);

const activitySummarySchema = new mongoose.Schema(
  {
    activity: { type: String, required: true },
    intervals: { type: [intervalSchema], required: true },
  },
  { _id: false }
);

const summarySchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    type: {
      type: String,
      enum: ["day", "week"],
      required: true,
    },

    startDate: { type: Date, required: true }, // start of day or Monday of week
    endDate: { type: Date, required: true },   // end of day or Sunday of week

    summary: { type: [activitySummarySchema], required: true },
  },
  { timestamps: true }
);

// TTL index: delete summaries older than 6 weeks
summarySchema.index({ createdAt: 1 }, { expireAfterSeconds: 6 * 7 * 24 * 60 * 60 });

// Ensure uniqueness per user + type + startDate
summarySchema.index({ user: 1, type: 1, startDate: 1 }, { unique: true });

export default mongoose.model("Summary", summarySchema);

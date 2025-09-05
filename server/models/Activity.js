import mongoose from "mongoose";

const activitySchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  date: { type: Date, required: true }, // truncated to the minute
  activity: {
    type: String,
    enum: [
      "working", "learning", "sleeping", "training", "playing",
      "socializing", "hobbying", "others"
    ],
    required: true,
  },
}, { timestamps: true });

activitySchema.pre("save", function(next) {
  this.date.setSeconds(0, 0); 
  next();
});

activitySchema.index({ user: 1, date: 1 }, { unique: true });

export default mongoose.model("Activity", activitySchema);

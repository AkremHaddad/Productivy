import mongoose from "mongoose";

const activitySchema = new mongoose.Schema({
  user: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "User", 
    required: true 
  },

  // Truncated timestamp (to the minute)
  date: { 
    type: Date, 
    required: true 
  },

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
      "others"
    ],
    required: true,
  },
}, { timestamps: true }); // add createdAt, updatedAt if we ever need them

// ✅ Ensure date is always truncated to the minute before saving
activitySchema.pre("save", function (next) {
  this.date.setSeconds(0, 0); 
  next();
});

// optional index so we can query fast per user/day
activitySchema.index({ user: 1, date: 1 }, { unique: true });

export default mongoose.model("Activity", activitySchema);

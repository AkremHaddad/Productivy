import mongoose from "mongoose";

const productiveTimeSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  minutes: {
    type: Number,
    default: 0
  }
});

// Ensure each user has only one document per day
productiveTimeSchema.index({ user: 1, date: 1 }, { unique: true });

export default mongoose.model("ProductiveTime", productiveTimeSchema);

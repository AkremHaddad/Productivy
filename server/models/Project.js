
// ==================== MODELS (Project.js) ====================
import mongoose from "mongoose";

const TaskSchema = new mongoose.Schema({
  title: { type: String, required: true },
  completed: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
});

const SprintSchema = new mongoose.Schema({
  title: { type: String, required: true },
  tasks: [TaskSchema],
  createdAt: { type: Date, default: Date.now },
});

const CardSchema = new mongoose.Schema({
  title: { type: String, required: true }, // Changed from 'text' to 'title' for consistency
  description: { type: String }, // Added optional description field
  createdAt: { type: Date, default: Date.now },
});

const ColumnSchema = new mongoose.Schema({
  title: { type: String, required: true },
  color: {
    fill: { type: String, default: "#D1D5DB" },
    border: { type: String, default: "#6B7280" }
  },
  cards: [CardSchema],
  createdAt: { type: Date, default: Date.now },
});

const BoardSchema = new mongoose.Schema({
  title: { type: String, required: true },
  columns: [ColumnSchema],
  createdAt: { type: Date, default: Date.now },
});

const ProjectSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  name: { type: String, required: true },
  sprints: [SprintSchema],
  boards: [BoardSchema],
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model("Project", ProjectSchema);

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
  title: { type: String}, 
  description: { type: String }, 
  createdAt: { type: Date, default: Date.now },
});

const ColumnSchema = new mongoose.Schema({
  title: { type: String, required: true },
  color: {
    type: String,
    enum: ["grey", "red", "blue", "green", "pink", "yellow", "orange", "purple"],
    default: "grey"
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
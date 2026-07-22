
// ==================== MODELS (Project.js) ====================
import mongoose from "mongoose";

const TaskSchema = new mongoose.Schema({
  title: { type: String, required: true, maxlength: 200 },
  completed: { type: Boolean, default: false },
  note: { type: String, default: "", maxlength: 500 },
  createdAt: { type: Date, default: Date.now },
});

const SprintSchema = new mongoose.Schema({
  title: { type: String, required: true, maxlength: 80 },
  tasks: [TaskSchema],
  createdAt: { type: Date, default: Date.now },
});

const CardSchema = new mongoose.Schema({
  title: { type: String, maxlength: 150 },
  description: { type: String, maxlength: 2000 },
  completed: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
});

const ColumnSchema = new mongoose.Schema({
  title: { type: String, required: true, maxlength: 40 },
  color: {
    type: String,
    enum: ["grey", "red", "blue", "green", "pink", "yellow", "orange", "purple"],
    default: "grey"
  },
  cards: [CardSchema],
  createdAt: { type: Date, default: Date.now },
});


const BoardSchema = new mongoose.Schema({
  title: { type: String, required: true, maxlength: 60 },
  columns: [ColumnSchema],
  createdAt: { type: Date, default: Date.now },
});

const ProjectSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
  name: { type: String, required: true, maxlength: 60 },
  sprints: [SprintSchema],
  boards: [BoardSchema],
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model("Project", ProjectSchema);
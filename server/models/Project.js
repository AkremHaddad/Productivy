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

const ProjectSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  name: { type: String, required: true },
  sprints: [SprintSchema],
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model("Project", ProjectSchema);

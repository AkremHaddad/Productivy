import mongoose from "mongoose";

const goalSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: String,
  status: { type: String, enum: ['pending', 'in-progress', 'completed'], default: 'pending' },
});

const taskSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: String,
  status: { type: String, enum: ['todo', 'doing', 'finished'], default: 'todo' },
});

const listSchema = new mongoose.Schema({
  name: { type: String, required: true }, // e.g., 'todo', 'doing'
  tasks: [taskSchema],
});

const sprintSchema = new mongoose.Schema({
  name: { type: String, required: true }, // e.g., 'Sprint 1'
  sprintGoals: [goalSchema],
});

const projectSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  sprints: [sprintSchema],
  board: {
    lists: [listSchema],
  },
}, { timestamps: true });

export default mongoose.model('Project', projectSchema);
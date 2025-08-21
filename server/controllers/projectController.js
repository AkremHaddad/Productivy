import Project from "../models/Project.js";

// Get all projects for a user
export const getProjects = async (req, res) => {
  try {
    const projects = await Project.find({ userId: req.user.id });
    res.json(projects);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Add a new project
export const addProject = async (req, res) => {
  try {
    const { name } = req.body;
    if (!name) return res.status(400).json({ error: "Project name is required" });

    const newProject = new Project({
      name,
      userId: req.user.id,
      sprints: [],
    });

    await newProject.save();
    res.json(newProject);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get a single project
export const getProject = async (req, res) => {
  try {
    const project = await Project.findOne({ _id: req.params.id, userId: req.user.id });
    if (!project) return res.status(404).json({ error: "Project not found" });
    res.json(project);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Add a sprint
export const addSprint = async (req, res) => {
  try {
    const { projectId } = req.params;
    const { title } = req.body;
    if (!title?.trim()) return res.status(400).json({ error: "Sprint title required" });

    const project = await Project.findOne({ _id: projectId, userId: req.user.id });
    if (!project) return res.status(404).json({ error: "Project not found" });

    project.sprints.push({ title: title.trim(), tasks: [] });
    await project.save();

    res.json(project.sprints);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Add a task to a sprint
export const addTask = async (req, res) => {
  try {
    const { projectId, sprintId } = req.params;
    const { title } = req.body;
    if (!title?.trim()) return res.status(400).json({ error: "Task title required" });

    const project = await Project.findOne({ _id: projectId, userId: req.user.id });
    if (!project) return res.status(404).json({ error: "Project not found" });

    const sprint = project.sprints.id(sprintId);
    if (!sprint) return res.status(404).json({ error: "Sprint not found" });

    sprint.tasks.push({ title: title.trim() });
    await project.save();

    res.json(sprint.tasks);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Toggle task completion
export const toggleTask = async (req, res) => {
  try {
    const { projectId, sprintId, taskId } = req.params;

    const project = await Project.findOne({ _id: projectId, userId: req.user.id });
    if (!project) return res.status(404).json({ error: "Project not found" });

    const sprint = project.sprints.id(sprintId);
    if (!sprint) return res.status(404).json({ error: "Sprint not found" });

    const task = sprint.tasks.id(taskId);
    if (!task) return res.status(404).json({ error: "Task not found" });

    task.completed = !task.completed;
    await project.save();

    res.json(task);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get tasks of a sprint
export const getSprintTasks = async (req, res) => {
  try {
    const { projectId, sprintId } = req.params;

    const project = await Project.findOne({ _id: projectId, userId: req.user.id });
    if (!project) return res.status(404).json({ error: "Project not found" });

    const sprint = project.sprints.id(sprintId);
    if (!sprint) return res.status(404).json({ error: "Sprint not found" });

    res.json(sprint.tasks);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

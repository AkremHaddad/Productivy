// ==================== CONTROLLERS (projectController.js) ====================
import Project from "../models/Project.js";

// Helper function to find project with user validation
const findProjectByUser = async (projectId, userId) => {
  const project = await Project.findOne({ _id: projectId, userId });
  if (!project) throw new Error("Project not found");
  return project;
};

// ==================== Projects ====================
export const getProjects = async (req, res) => {
  try {
    const projects = await Project.find({ userId: req.user.id });
    res.json(projects);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getProject = async (req, res) => {
  try {
    const project = await findProjectByUser(req.params.id, req.user.id);
    res.json(project);
  } catch (err) {
    if (err.message === "Project not found") {
      return res.status(404).json({ error: err.message });
    }
    res.status(500).json({ error: err.message });
  }
};

export const addProject = async (req, res) => {
  try {
    const { name } = req.body;
    if (!name?.trim()) return res.status(400).json({ error: "Project name is required" });

    const newProject = new Project({
      name: name.trim(),
      userId: req.user.id,
      sprints: [],
      boards: [],
    });

    await newProject.save();
    res.status(201).json(newProject);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ==================== Sprints ====================
export const addSprint = async (req, res) => {
  try {
    const { projectId } = req.params;
    const { title } = req.body;
    if (!title?.trim()) return res.status(400).json({ error: "Sprint title required" });

    const project = await findProjectByUser(projectId, req.user.id);
    project.sprints.push({ title: title.trim(), tasks: [] });
    await project.save();

    res.status(201).json(project.sprints);
  } catch (err) {
    if (err.message === "Project not found") {
      return res.status(404).json({ error: err.message });
    }
    res.status(500).json({ error: err.message });
  }
};

export const updateSprint = async (req, res) => {
  try {
    const { projectId, sprintId } = req.params;
    const { title } = req.body;
    if (!title?.trim()) return res.status(400).json({ error: "Sprint title required" });

    const project = await findProjectByUser(projectId, req.user.id);
    const sprint = project.sprints.id(sprintId);
    if (!sprint) return res.status(404).json({ error: "Sprint not found" });

    sprint.title = title.trim();
    await project.save();

    res.json(sprint);
  } catch (err) {
    if (err.message === "Project not found") {
      return res.status(404).json({ error: err.message });
    }
    res.status(500).json({ error: err.message });
  }
};

export const deleteSprint = async (req, res) => {
  try {
    const { projectId, sprintId } = req.params;

    const project = await findProjectByUser(projectId, req.user.id);
    const sprint = project.sprints.id(sprintId);
    if (!sprint) return res.status(404).json({ error: "Sprint not found" });

    project.sprints.pull(sprintId);
    await project.save();

    res.json(project.sprints);
  } catch (err) {
    if (err.message === "Project not found") {
      return res.status(404).json({ error: err.message });
    }
    res.status(500).json({ error: err.message });
  }
};

// ==================== Tasks ====================
export const getSprintTasks = async (req, res) => {
  try {
    const { projectId, sprintId } = req.params;

    const project = await findProjectByUser(projectId, req.user.id);
    const sprint = project.sprints.id(sprintId);
    if (!sprint) return res.status(404).json({ error: "Sprint not found" });

    res.json(sprint.tasks);
  } catch (err) {
    if (err.message === "Project not found") {
      return res.status(404).json({ error: err.message });
    }
    res.status(500).json({ error: err.message });
  }
};

export const addTask = async (req, res) => {
  try {
    const { projectId, sprintId } = req.params;
    const { title } = req.body;
    if (!title?.trim()) return res.status(400).json({ error: "Task title required" });

    const project = await findProjectByUser(projectId, req.user.id);
    const sprint = project.sprints.id(sprintId);
    if (!sprint) return res.status(404).json({ error: "Sprint not found" });

    sprint.tasks.push({ title: title.trim() });
    await project.save();

    res.status(201).json(sprint.tasks);
  } catch (err) {
    if (err.message === "Project not found") {
      return res.status(404).json({ error: err.message });
    }
    res.status(500).json({ error: err.message });
  }
};

export const updateTask = async (req, res) => {
  try {
    const { projectId, sprintId, taskId } = req.params;
    const { title } = req.body;
    if (!title?.trim()) return res.status(400).json({ error: "Task title required" });

    const project = await findProjectByUser(projectId, req.user.id);
    const sprint = project.sprints.id(sprintId);
    if (!sprint) return res.status(404).json({ error: "Sprint not found" });

    const task = sprint.tasks.id(taskId);
    if (!task) return res.status(404).json({ error: "Task not found" });

    task.title = title.trim();
    await project.save();

    res.json(task);
  } catch (err) {
    if (err.message === "Project not found") {
      return res.status(404).json({ error: err.message });
    }
    res.status(500).json({ error: err.message });
  }
};

export const toggleTask = async (req, res) => {
  try {
    const { projectId, sprintId, taskId } = req.params;

    const project = await findProjectByUser(projectId, req.user.id);
    const sprint = project.sprints.id(sprintId);
    if (!sprint) return res.status(404).json({ error: "Sprint not found" });

    const task = sprint.tasks.id(taskId);
    if (!task) return res.status(404).json({ error: "Task not found" });

    task.completed = !task.completed;
    await project.save();

    res.json(task);
  } catch (err) {
    if (err.message === "Project not found") {
      return res.status(404).json({ error: err.message });
    }
    res.status(500).json({ error: err.message });
  }
};

export const deleteTask = async (req, res) => {
  try {
    const { projectId, sprintId, taskId } = req.params;

    const project = await findProjectByUser(projectId, req.user.id);
    const sprint = project.sprints.id(sprintId);
    if (!sprint) return res.status(404).json({ error: "Sprint not found" });

    const task = sprint.tasks.id(taskId);
    if (!task) return res.status(404).json({ error: "Task not found" });

    sprint.tasks.pull(taskId);
    await project.save();

    res.json(sprint.tasks);
  } catch (err) {
    if (err.message === "Project not found") {
      return res.status(404).json({ error: err.message });
    }
    res.status(500).json({ error: err.message });
  }
};

// ==================== Boards ====================
export const addBoard = async (req, res) => {
  try {
    const { projectId } = req.params;
    const { title } = req.body;

    const project = await findProjectByUser(projectId, req.user.id);
    const newBoard = { 
      title: title?.trim() || "New Board", 
      columns: [] 
    };
    project.boards.push(newBoard);
    await project.save();

    res.status(201).json(project.boards);
  } catch (err) {
    if (err.message === "Project not found") {
      return res.status(404).json({ error: err.message });
    }
    res.status(500).json({ error: err.message });
  }
};

export const updateBoard = async (req, res) => {
  try {
    const { projectId, boardId } = req.params;
    const { title } = req.body;
    if (!title?.trim()) return res.status(400).json({ error: "Board title required" });

    const project = await findProjectByUser(projectId, req.user.id);
    const board = project.boards.id(boardId);
    if (!board) return res.status(404).json({ error: "Board not found" });

    board.title = title.trim();
    await project.save();

    res.json(board);
  } catch (err) {
    if (err.message === "Project not found") {
      return res.status(404).json({ error: err.message });
    }
    res.status(500).json({ error: err.message });
  }
};

export const deleteBoard = async (req, res) => {
  try {
    const { projectId, boardId } = req.params;

    const project = await findProjectByUser(projectId, req.user.id);
    const board = project.boards.id(boardId);
    if (!board) return res.status(404).json({ error: "Board not found" });

    project.boards.pull(boardId);
    await project.save();

    res.json(project.boards);
  } catch (err) {
    if (err.message === "Project not found") {
      return res.status(404).json({ error: err.message });
    }
    res.status(500).json({ error: err.message });
  }
};

// ==================== Columns ====================
export const addColumn = async (req, res) => {
  try {
    const { projectId, boardId } = req.params;
    const { title, color } = req.body;

    const project = await findProjectByUser(projectId, req.user.id);
    const board = project.boards.id(boardId);
    if (!board) return res.status(404).json({ error: "Board not found" });

    const newColumn = { 
      title: title?.trim() || "New Column", 
      cards: [],
      color: color || { fill: "#D1D5DB", border: "#6B7280" }
    };
    board.columns.push(newColumn);
    await project.save();

    res.status(201).json(board.columns);
  } catch (err) {
    if (err.message === "Project not found") {
      return res.status(404).json({ error: err.message });
    }
    res.status(500).json({ error: err.message });
  }
};

export const updateColumn = async (req, res) => {
  try {
    const { projectId, boardId, columnId } = req.params;
    const { title, color } = req.body;

    const project = await findProjectByUser(projectId, req.user.id);
    const board = project.boards.id(boardId);
    if (!board) return res.status(404).json({ error: "Board not found" });

    const column = board.columns.id(columnId);
    if (!column) return res.status(404).json({ error: "Column not found" });

    if (title?.trim()) column.title = title.trim();
    if (color) column.color = color;
    await project.save();

    res.json(column);
  } catch (err) {
    if (err.message === "Project not found") {
      return res.status(404).json({ error: err.message });
    }
    res.status(500).json({ error: err.message });
  }
};

export const deleteColumn = async (req, res) => {
  try {
    const { projectId, boardId, columnId } = req.params;

    const project = await findProjectByUser(projectId, req.user.id);
    const board = project.boards.id(boardId);
    if (!board) return res.status(404).json({ error: "Board not found" });

    const column = board.columns.id(columnId);
    if (!column) return res.status(404).json({ error: "Column not found" });

    board.columns.pull(columnId);
    await project.save();

    res.json(board.columns);
  } catch (err) {
    if (err.message === "Project not found") {
      return res.status(404).json({ error: err.message });
    }
    res.status(500).json({ error: err.message });
  }
};

// ==================== Cards ====================
export const addCard = async (req, res) => {
  try {
    const { projectId, boardId, columnId } = req.params;
    const { title, description } = req.body;
    if (!title?.trim()) return res.status(400).json({ error: "Card title required" });

    const project = await findProjectByUser(projectId, req.user.id);
    const board = project.boards.id(boardId);
    if (!board) return res.status(404).json({ error: "Board not found" });

    const column = board.columns.id(columnId);
    if (!column) return res.status(404).json({ error: "Column not found" });

    const newCard = { 
      title: title.trim(),
      description: description?.trim() || ""
    };
    column.cards.push(newCard);
    await project.save();

    res.status(201).json(column.cards);
  } catch (err) {
    if (err.message === "Project not found") {
      return res.status(404).json({ error: err.message });
    }
    res.status(500).json({ error: err.message });
  }
};

export const updateCard = async (req, res) => {
  try {
    const { projectId, boardId, columnId, cardId } = req.params;
    const { title, description } = req.body;

    const project = await findProjectByUser(projectId, req.user.id);
    const board = project.boards.id(boardId);
    if (!board) return res.status(404).json({ error: "Board not found" });

    const column = board.columns.id(columnId);
    if (!column) return res.status(404).json({ error: "Column not found" });

    const card = column.cards.id(cardId);
    if (!card) return res.status(404).json({ error: "Card not found" });

    if (title?.trim()) card.title = title.trim();
    if (description !== undefined) card.description = description?.trim() || "";
    await project.save();

    res.json(card);
  } catch (err) {
    if (err.message === "Project not found") {
      return res.status(404).json({ error: err.message });
    }
    res.status(500).json({ error: err.message });
  }
};

export const deleteCard = async (req, res) => {
  try {
    const { projectId, boardId, columnId, cardId } = req.params;

    const project = await findProjectByUser(projectId, req.user.id);
    const board = project.boards.id(boardId);
    if (!board) return res.status(404).json({ error: "Board not found" });

    const column = board.columns.id(columnId);
    if (!column) return res.status(404).json({ error: "Column not found" });

    const card = column.cards.id(cardId);
    if (!card) return res.status(404).json({ error: "Card not found" });

    column.cards.pull(cardId);
    await project.save();

    res.json(column.cards);
  } catch (err) {
    if (err.message === "Project not found") {
      return res.status(404).json({ error: err.message });
    }
    res.status(500).json({ error: err.message });
  }
};
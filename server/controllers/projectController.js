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

export const deleteProject = async (req, res) => {
  try {
    const project = await Project.findOne({ _id: req.params.id, userId: req.user.id });
    if (!project) return res.status(404).json({ error: "Project not found" });

    await project.deleteOne();
    res.json({ message: "Project deleted successfully" });
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
export const changeTaskOrder = async (req, res) => {
  const { projectId, sprintId } = req.params;
  const { taskIds } = req.body; // array of task IDs in new order

  try {
    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    const sprint = project.sprints.id(sprintId);
    if (!sprint) {
      return res.status(404).json({ message: "Sprint not found" });
    }

    // Map existing tasks by ID for lookup
    const taskMap = {};
    sprint.tasks.forEach(task => {
      taskMap[task._id.toString()] = task;
    });

    // Rebuild tasks array in new order
    const reorderedTasks = taskIds
      .map(id => taskMap[id])
      .filter(Boolean); // remove invalid IDs

    if (reorderedTasks.length !== sprint.tasks.length) {
      return res.status(400).json({ message: "Invalid task IDs provided" });
    }

    sprint.tasks = reorderedTasks;
    await project.save();

    res.status(200).json({ message: "Task order updated", tasks: sprint.tasks });
  } catch (error) {
    console.error("Error changing task order:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

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

// ==================== Columns Controller ====================
const ALLOWED_COLORS = ["grey","red","blue","green","pink","yellow","orange","purple"];

export const addColumn = async (req, res) => {
  try {
    const { projectId, boardId } = req.params;
    const { title, color } = req.body;

    const project = await findProjectByUser(projectId, req.user.id);
    if (!project) return res.status(404).json({ error: "Project not found" });

    const board = project.boards.id(boardId);
    if (!board) return res.status(404).json({ error: "Board not found" });

    const columnTitle = title?.trim() || "New Column";
    const columnColor = ALLOWED_COLORS.includes(color) ? color : "grey";

    const newColumn = {
      title: columnTitle,
      color: columnColor,
      cards: [],
    };

    board.columns.push(newColumn);
    await project.save();

    // get the last column from the board (Mongoose adds _id automatically)
    const addedColumn = board.columns[board.columns.length - 1];

    res.status(201).json(addedColumn);

  } catch (err) {
    console.error("Error in addColumn:", err);
    res.status(500).json({ error: "Server error" });
  }
};

export const updateColumn = async (req, res) => {
  try {
    const { projectId, boardId, columnId } = req.params;
    const { title, color } = req.body;

    const project = await findProjectByUser(projectId, req.user.id);
    if (!project) return res.status(404).json({ error: "Project not found" });

    const board = project.boards.id(boardId);
    if (!board) return res.status(404).json({ error: "Board not found" });

    const column = board.columns.id(columnId);
    if (!column) return res.status(404).json({ error: "Column not found" });

    if (title !== undefined) {
      const trimmed = title.trim();
      if (!trimmed) return res.status(400).json({ error: "Title cannot be empty" });
      column.title = trimmed;
    }

    if (color !== undefined) {
      if (!ALLOWED_COLORS.includes(color)) return res.status(400).json({ error: "Invalid color" });
      column.color = color;
    }

    await project.save();
    res.json(column);
  } catch (err) {
    console.error("Error in updateColumn:", err);
    res.status(500).json({ error: "Server error" });
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
    console.error("Error in deleteColumn:", err);
    res.status(500).json({ error: "Server error" });
  }
};


export const changeColumnOrder = async (req, res) => {
  const { projectId, boardId } = req.params;
  const { newOrder } = req.body; // Array of column IDs in desired order

  try {
    const project = await Project.findById(projectId);
    if (!project) return res.status(404).json({ message: "Project not found" });

    const board = project.boards.id(boardId);
    if (!board) return res.status(404).json({ message: "Board not found" });

    // Reorder columns
    board.columns = newOrder.map(id => board.columns.id(id));
    await project.save();

    res.json(board.columns);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to reorder columns" });
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

export const changeCardOrder = async (req, res) => {
  const { projectId, boardId } = req.params;
  const { newColumns } = req.body; 
  // newColumns = [{ _id: columnId, cards: [cardId1, cardId2, ...] }, ...]

  try {
    const project = await Project.findById(projectId);
    if (!project) return res.status(404).json({ message: "Project not found" });

    const board = project.boards.id(boardId);
    if (!board) return res.status(404).json({ message: "Board not found" });

    // Build a map of all cards by _id
    const allCards = {};
    board.columns.forEach(col => {
      col.cards.forEach(card => {
        allCards[card._id.toString()] = card;
      });
    });

    // Rebuild columns with cards from the map
    newColumns.forEach(colOrder => {
      const column = board.columns.id(colOrder._id);
      if (column) {
        column.cards = colOrder.cards
          .map(cardId => allCards[cardId])
          .filter(Boolean); // remove any missing cards just in case
      }
    });

    await project.save();
    res.json(board.columns);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to reorder cards" });
  }
};

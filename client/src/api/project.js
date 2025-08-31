// ==================== UPDATED API SERVICE (apiService.js) ====================
import API from "./API";

// ==================== Projects ====================
export const getProjects = async () => {
  const res = await API.get("/api/projects");
  return res.data;
};

export const getProject = async (id) => {
  const res = await API.get(`/api/projects/${id}`);
  return res.data;
};

export const createProject = async (name) => {
  const res = await API.post("/api/projects", { name });
  return res.data;
};

// ==================== Sprints ====================
export const addSprint = async (projectId, title) => {
  const res = await API.post(`/api/projects/${projectId}/sprints`, { title });
  return res.data;
};

export const updateSprint = async (projectId, sprintId, title) => {
  const res = await API.patch(`/api/projects/${projectId}/sprints/${sprintId}`, { title });
  return res.data;
};

export const deleteSprint = async (projectId, sprintId) => {
  const res = await API.delete(`/api/projects/${projectId}/sprints/${sprintId}`);
  return res.data;
};

// ==================== Tasks ====================
export const getSprintTasks = async (projectId, sprintId) => {
  const res = await API.get(`/api/projects/${projectId}/sprints/${sprintId}/tasks`);
  return res.data;
};

export const addTask = async (projectId, sprintId, title) => {
  const res = await API.post(`/api/projects/${projectId}/sprints/${sprintId}/tasks`, { title });
  return res.data;
};

export const updateTask = async (projectId, sprintId, taskId, title) => {
  const res = await API.patch(`/api/projects/${projectId}/sprints/${sprintId}/tasks/${taskId}`, { title });
  return res.data;
};

export const toggleTask = async (projectId, sprintId, taskId) => {
  const res = await API.patch(`/api/projects/${projectId}/sprints/${sprintId}/tasks/${taskId}/toggle`);
  return res.data;
};

export const deleteTask = async (projectId, sprintId, taskId) => {
  const res = await API.delete(`/api/projects/${projectId}/sprints/${sprintId}/tasks/${taskId}`);
  return res.data;
};

// ==================== Boards ====================
export const addBoard = async (projectId, title = "New Board") => {
  const res = await API.post(`/api/projects/${projectId}/boards`, { title });
  return res.data;
};

export const updateBoard = async (projectId, boardId, title) => {
  const res = await API.patch(`/api/projects/${projectId}/boards/${boardId}`, { title });
  return res.data;
};

export const deleteBoard = async (projectId, boardId) => {
  const res = await API.delete(`/api/projects/${projectId}/boards/${boardId}`);
  return res.data;
};

// ==================== Columns ====================
export const addColumn = async (projectId, boardId, title, color) => {
  const res = await API.post(`/api/projects/${projectId}/boards/${boardId}/columns`, {
    title,
    color,
  });
  return res.data;
};

export const updateColumn = async (projectId, boardId, columnId, data) => {
  const res = await API.patch(
    `/api/projects/${projectId}/boards/${boardId}/columns/${columnId}`,
    data
  );
  return res.data;
};

export const deleteColumn = async (projectId, boardId, columnId) => {
  const res = await API.delete(
    `/api/projects/${projectId}/boards/${boardId}/columns/${columnId}`
  );
  return res.data;
};

// ==================== Cards ====================
export const addCard = async (projectId, boardId, columnId, title, description) => {
  const res = await API.post(
    `/api/projects/${projectId}/boards/${boardId}/columns/${columnId}/cards`,
    { title, description }
  );
  return res.data;
};

export const updateCard = async (projectId, boardId, columnId, cardId, data) => {
  const res = await API.patch(
    `/api/projects/${projectId}/boards/${boardId}/columns/${columnId}/cards/${cardId}`,
    data
  );
  return res.data;
};

export const deleteCard = async (projectId, boardId, columnId, cardId) => {
  const res = await API.delete(
    `/api/projects/${projectId}/boards/${boardId}/columns/${columnId}/cards/${cardId}`
  );
  return res.data;
};
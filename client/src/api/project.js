import API from "./API";

// Projects
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

export const addSprint = async (projectId, title) => {
  const res = await API.post(`/api/projects/${projectId}/sprints`, { title });
  return res.data;
};

// Tasks
export const getSprintTasks = async (projectId, sprintId) => {
  const res = await API.get(`/api/projects/${projectId}/sprints/${sprintId}/tasks`);
  return res.data;
};

export const addTask = async (projectId, sprintId, title) => {
  const res = await API.post(`/api/projects/${projectId}/sprints/${sprintId}/tasks`, { title });
  return res.data;
};

export const toggleTask = async (projectId, sprintId, taskId) => {
  const res = await API.patch(
    `/api/projects/${projectId}/sprints/${sprintId}/tasks/${taskId}/toggle`
  );
  return res.data;
};

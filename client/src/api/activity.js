import API from "./API";

export const getStreak = async () => {
  const res = await API.get("/api/activity/streak");
  return res.data;
};

export const getHeatmap = async (days = 7) => {
  const res = await API.get(`/api/activity/heatmap?days=${days}`);
  return res.data;
};

export const getTotalFocusMinutes = async () => {
  const res = await API.get("/api/activity/total");
  return res.data;
};

export const getGoal = async () => {
  const res = await API.get("/api/activity/goal");
  return res.data;
};

export const setGoal = async (dailyGoalMinutes) => {
  const res = await API.patch("/api/activity/goal", { dailyGoalMinutes });
  return res.data;
};

export const getEvents = async (limit = 10) => {
  const res = await API.get(`/api/events?limit=${limit}`);
  return res.data;
};

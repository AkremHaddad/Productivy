import axios from "axios";

axios.defaults.withCredentials = true;
axios.defaults.baseURL = "http://localhost:5000";

// Get current user
export const getUser = async () => {
  try {
    const res = await axios.get("/api/auth/me");
    return res.data;
  } catch {
    return null;
  }
};

// Logout
export const logout = async () => {
  await axios.get("/api/auth/logout");
};

// Update activity
export const updateActivity = async () => {
  return API.post("/auth/activity", {}, { withCredentials: true });
};

// Get status of a user
export const getStatus = async (userId) => {
  return API.get(`/auth/status/${userId}`, { withCredentials: true });
};
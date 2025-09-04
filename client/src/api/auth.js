// src/api/auth.js
import API from "./API";

export const getUser = async () => {
  try {
    const res = await API.get("/api/auth/me");
    return res.data;
  } catch {
    return null;
  }
};

export const login = async (email, password) => {
  const res = await API.post("/api/auth/login", { email, password });
  return res.data;
};

export const register = async (username, email, password) => {
  const res = await API.post("/api/auth/register", { username, email, password });
  return res.data;
};

export const logout = async () => {
  await API.get("/api/auth/logout");
};

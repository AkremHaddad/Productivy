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

export const logout = async () => await API.get("/api/auth/logout");

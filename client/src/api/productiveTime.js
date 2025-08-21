// src/api/productiveTime.js
import API from "./API";

// Fetch today's productive time
export const getTodayProductiveTime = async () => {
  const res = await API.get("/api/productive-time/today");
  return res.data;
};

// Increment today's productive time by 1 minute
export const incrementProductiveTime = async () => {
  const res = await API.post("/api/productive-time/increment");
  return res.data;
};

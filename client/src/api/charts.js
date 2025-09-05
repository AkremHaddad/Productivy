import API from "./API";

export const fetchDailySummary = async (date) => {
  const res = await API.get(`api/charts/daily?date=${date}`);
  return res.data;
};

export const fetchWeeklySummary = async (date) => {
  const res = await API.get(`api/charts/weekly?date=${date}`);
  return res.data;
};

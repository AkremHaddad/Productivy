import axios from "axios";

// Get the base URL from the environment variable
const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL, // ✅ dynamic backend URL
  withCredentials: true,                 // keep cookies/sessions
});

export default API;

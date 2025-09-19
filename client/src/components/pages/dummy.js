export const activities = [
  "working",
  "learning",
  "sleeping",
  "training",
  "playing",
  "socializing",
  "hobbying",
  "others",
  "offline",
];

export const activityColors = {
  working: "#4f46e5",
  learning: "#16a34a",
  sleeping: "#0ea5e9",
  training: "#f59e0b",
  playing: "#ef4444",
  socializing: "#e11d48",
  hobbying: "#f97316",
  others: "#6b7280",
  offline: "#111",
};


// --- Helper to get weekday names ---
export const getWeekdayName = (dateStr) => {
  const date = new Date(dateStr);
  return date.toLocaleDateString("en-US", { weekday: "short" }); // Mon, Tue, ...
};

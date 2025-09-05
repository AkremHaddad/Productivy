// Dummy activity data for one user

// --- Day Summary ---
export const dummyDaySummary = {
  user: "user123",
  type: "day",
  date: "2025-09-01T00:00:00.000Z",
  summary: [
    {
      activity: "sleeping",
      intervals: [
        { start: "00:00", end: "07:30" }
      ]
    },
    {
      activity: "working",
      intervals: [
        { start: "07:30", end: "12:00" },
        { start: "13:00", end: "17:45" }
      ]
    },
    {
      activity: "hobbying",
      intervals: [
        { start: "12:00", end: "13:00" }
      ]
    },
    {
      activity: "playing",
      intervals: [
        { start: "17:45", end: "19:00" }
      ]
    },
    {
      activity: "socializing",
      intervals: [
        { start: "19:00", end: "21:00" }
      ]
    },
    {
      activity: "learning",
      intervals: [
        { start: "21:00", end: "22:30" }
      ]
    },
    {
      activity: "others",
      intervals: [
        { start: "22:30", end: "23:59" }
      ]
    }
  ]
};

// --- Week Summary ---
// src/pages/dummy.js
export const activities = [
  "working",
  "learning",
  "sleeping",
  "training",
  "playing",
  "socializing",
  "hobbying",
  "others",
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
};

// Helper to expand summary into minute-by-minute distribution
export const generateFullDayWeeklyDummy = () => {
  const summary = [];

  // Example intervals, you can customize
  const intervals = [
    { start: "00:00", end: "06:00", distribution: { sleeping: 1 } },
    { start: "06:00", end: "08:00", distribution: { working: 0.7, learning: 0.3 } },
    { start: "08:00", end: "12:00", distribution: { working: 0.8, learning: 0.2 } },
    { start: "12:00", end: "13:00", distribution: { hobbying: 1 } },
    { start: "13:00", end: "17:00", distribution: { working: 0.6, playing: 0.4 } },
    { start: "17:00", end: "19:00", distribution: { playing: 0.7, socializing: 0.3 } },
    { start: "19:00", end: "21:00", distribution: { socializing: 0.8, hobbying: 0.2 } },
    { start: "21:00", end: "23:59", distribution: { learning: 0.5, others: 0.5 } },
  ];

  // Convert intervals to minute-by-minute
  for (let i = 0; i < intervals.length; i++) {
    const { start, end, distribution } = intervals[i];
    const [sh, sm] = start.split(":").map(Number);
    const [eh, em] = end.split(":").map(Number);
    const startMin = sh * 60 + sm;
    const endMin = eh * 60 + em;

    for (let m = startMin; m < endMin; m++) {
      const hh = String(Math.floor(m / 60)).padStart(2, "0");
      const mm = String(m % 60).padStart(2, "0");
      summary.push({ time: `${hh}:${mm}`, distribution });
    }
  }

  return {
    user: "user123",
    type: "week",
    startDate: "2025-08-25T00:00:00.000Z",
    endDate: "2025-08-31T23:59:59.000Z",
    summary,
  };
};

export const dummyWeeklySummary = generateFullDayWeeklyDummy();

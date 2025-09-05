// --- Single day summary ---
export const dummyDaySummary = {
  summary: [
    {
      activity: "sleeping",
      intervals: [{ start: "00:00", end: "07:30" }],
    },
    {
      activity: "working",
      intervals: [
        { start: "07:30", end: "12:00" },
        { start: "13:00", end: "17:45" },
      ],
    },
    {
      activity: "hobbying",
      intervals: [{ start: "12:00", end: "13:00" }],
    },
    {
      activity: "playing",
      intervals: [{ start: "17:45", end: "19:00" }],
    },
    {
      activity: "socializing",
      intervals: [{ start: "19:00", end: "21:00" }],
    },
    {
      activity: "learning",
      intervals: [{ start: "21:00", end: "22:30" }],
    },
    {
      activity: "others",
      intervals: [{ start: "22:30", end: "23:59" }],
    },
  ],
};

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

// --- Generate dummy week data with slight variations ---
export const dummyWeekSummary = Array.from({ length: 7 }, (_, i) => {
  const day = new Date();
  day.setDate(day.getDate() - (i + 1)); // yesterday, 2 days ago, etc.

  // Clone summary and randomize end times slightly
  const summary = dummyDaySummary.summary.map((act) => {
    const intervals = act.intervals.map((intv) => {
      const startH = parseInt(intv.start.split(":")[0]);
      const startM = parseInt(intv.start.split(":")[1]);
      const endH = parseInt(intv.end.split(":")[0]);
      const endM = parseInt(intv.end.split(":")[1]);

      // Randomly add/subtract up to 30 minutes
      const deltaStart = Math.floor(Math.random() * 31) - 15;
      const deltaEnd = Math.floor(Math.random() * 31) - 15;

      const newStart = new Date(0, 0, 0, startH, startM + deltaStart);
      const newEnd = new Date(0, 0, 0, endH, endM + deltaEnd);

      const formatTime = (d) =>
        `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;

      return {
        start: formatTime(newStart),
        end: formatTime(newEnd),
      };
    });
    return { ...act, intervals };
  });

  return {
    date: day.toISOString().slice(0, 10),
    summary,
  };
});

// --- Helper to get weekday names ---
export const getWeekdayName = (dateStr) => {
  const date = new Date(dateStr);
  return date.toLocaleDateString("en-US", { weekday: "short" }); // Mon, Tue, ...
};

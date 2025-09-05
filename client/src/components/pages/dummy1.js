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

// Generate more realistic weekly data with variations by day
export const generateFullDayWeeklyDummy = () => {
  const summary = [];
  
  // Define base patterns for weekdays vs weekends
  const weekdayPatterns = [
    { start: "00:00", end: "06:30", distribution: { sleeping: 1 } },
    { start: "06:30", end: "07:30", distribution: { working: 0.6, training: 0.4 } },
    { start: "07:30", end: "08:30", distribution: { working: 0.8, learning: 0.2 } },
    { start: "08:30", end: "12:00", distribution: { working: 0.9, others: 0.1 } },
    { start: "12:00", end: "13:00", distribution: { hobbying: 0.7, socializing: 0.3 } },
    { start: "13:00", end: "17:00", distribution: { working: 0.8, playing: 0.2 } },
    { start: "17:00", end: "18:30", distribution: { training: 0.6, playing: 0.4 } },
    { start: "18:30", end: "20:00", distribution: { socializing: 0.7, hobbying: 0.3 } },
    { start: "20:00", end: "22:00", distribution: { learning: 0.6, playing: 0.4 } },
    { start: "22:00", end: "23:59", distribution: { sleeping: 1 } },
  ];
  
  const weekendPatterns = [
    { start: "00:00", end: "08:30", distribution: { sleeping: 1 } },
    { start: "08:30", end: "10:00", distribution: { training: 0.5, hobbying: 0.5 } },
    { start: "10:00", end: "12:00", distribution: { learning: 0.4, hobbying: 0.6 } },
    { start: "12:00", end: "14:00", distribution: { socializing: 0.8, playing: 0.2 } },
    { start: "14:00", end: "16:00", distribution: { hobbying: 0.7, others: 0.3 } },
    { start: "16:00", end: "18:00", distribution: { playing: 0.6, training: 0.4 } },
    { start: "18:00", end: "20:00", distribution: { socializing: 0.9, others: 0.1 } },
    { start: "20:00", end: "22:30", distribution: { playing: 0.5, learning: 0.5 } },
    { start: "22:30", end: "23:59", distribution: { sleeping: 1 } },
  ];

  // Generate data for each minute of the day (1440 minutes)
  for (let minute = 0; minute < 1440; minute++) {
    const hh = String(Math.floor(minute / 60)).padStart(2, "0");
    const mm = String(minute % 60).padStart(2, "0");
    const time = `${hh}:${mm}`;
    
    // Determine which pattern to use based on time
    const patterns = minute < 360 || minute >= 1320 ? weekdayPatterns : weekendPatterns; // Rough approximation
    
    // Find the matching pattern interval
    let distribution = { others: 1 }; // Default
    
    for (const pattern of patterns) {
      const [startH, startM] = pattern.start.split(":").map(Number);
      const [endH, endM] = pattern.end.split(":").map(Number);
      const startMin = startH * 60 + startM;
      const endMin = endH * 60 + endM;
      
      if (minute >= startMin && minute < endMin) {
        // Add some random variation to make it more realistic
        const variedDistribution = {};
        for (const [activity, value] of Object.entries(pattern.distribution)) {
          // Add ±20% random variation
          variedDistribution[activity] = Math.max(0, Math.min(1, value * (0.8 + Math.random() * 0.4)));
        }
        distribution = variedDistribution;
        break;
      }
    }
    
    summary.push({ time, distribution });
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
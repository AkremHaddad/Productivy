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

  const weekdayPatterns = [
    { start: "00:00", distribution: { sleeping: 1 } },
    { start: "06:30", distribution: { working: 0.6, training: 0.4 } },
    { start: "07:30", distribution: { working: 0.8, learning: 0.2 } },
    { start: "08:30", distribution: { working: 0.9, others: 0.1 } },
    { start: "12:00", distribution: { hobbying: 0.7, socializing: 0.3 } },
    { start: "13:00", distribution: { working: 0.8, playing: 0.2 } },
    { start: "17:00", distribution: { training: 0.6, playing: 0.4 } },
    { start: "18:30", distribution: { socializing: 0.7, hobbying: 0.3 } },
    { start: "20:00", distribution: { learning: 0.6, playing: 0.4 } },
    { start: "22:00", distribution: { sleeping: 1 } },
  ];

  const weekendPatterns = [
    { start: "00:00", distribution: { sleeping: 1 } },
    { start: "08:30", distribution: { training: 0.5, hobbying: 0.5 } },
    { start: "10:00", distribution: { learning: 0.4, hobbying: 0.6 } },
    { start: "12:00", distribution: { socializing: 0.8, playing: 0.2 } },
    { start: "14:00", distribution: { hobbying: 0.7, others: 0.3 } },
    { start: "16:00", distribution: { playing: 0.6, training: 0.4 } },
    { start: "18:00", distribution: { socializing: 0.9, others: 0.1 } },
    { start: "20:00", distribution: { playing: 0.5, learning: 0.5 } },
    { start: "22:30", distribution: { sleeping: 1 } },
  ];

  const timeToMinutes = (t) => {
    const [h, m] = t.split(":").map(Number);
    return h * 60 + m;
  };

  const interpolate = (dist1, dist2, t) => {
    const result = {};
    const allActs = new Set([...Object.keys(dist1), ...Object.keys(dist2)]);
    for (const act of allActs) {
      const v1 = dist1[act] || 0;
      const v2 = dist2[act] || 0;
      result[act] = v1 + (v2 - v1) * t;
    }
    // Normalize
    const total = Object.values(result).reduce((a, b) => a + b, 0);
    for (const act of Object.keys(result)) result[act] /= total;
    return result;
  };

  const generateDay = (patterns) => {
    const daySummary = [];
    const minutesInDay = 1440;

    // Convert pattern start times to minutes
    const patternTimes = patterns.map((p) => ({
      start: timeToMinutes(p.start),
      distribution: p.distribution,
    }));

    // Add a pseudo endpoint at 24:00 for interpolation
    patternTimes.push({ start: minutesInDay, distribution: patternTimes[patternTimes.length - 1].distribution });

    for (let i = 0; i < minutesInDay; i++) {
      const hh = String(Math.floor(i / 60)).padStart(2, "0");
      const mm = String(i % 60).padStart(2, "0");
      const time = `${hh}:${mm}`;

      // Find the surrounding patterns
      let prev = patternTimes[0];
      let next = patternTimes[patternTimes.length - 1];

      for (let j = 0; j < patternTimes.length - 1; j++) {
        if (i >= patternTimes[j].start && i < patternTimes[j + 1].start) {
          prev = patternTimes[j];
          next = patternTimes[j + 1];
          break;
        }
      }

      const t = (i - prev.start) / (next.start - prev.start); // interpolation factor 0..1
      let distribution = interpolate(prev.distribution, next.distribution, t);

      // Add small random variation ±5%
      for (const act of Object.keys(distribution)) {
        distribution[act] *= 0.95 + Math.random() * 0.1;
      }
      // Normalize again
      const total = Object.values(distribution).reduce((a, b) => a + b, 0);
      for (const act of Object.keys(distribution)) distribution[act] /= total;

      daySummary.push({ time, distribution });
    }

    return daySummary;
  };

  // Build the week: 5 weekdays + 2 weekends
  for (let d = 0; d < 7; d++) {
    const patterns = d < 5 ? weekdayPatterns : weekendPatterns;
    const dayData = generateDay(patterns);
    summary.push(...dayData);
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

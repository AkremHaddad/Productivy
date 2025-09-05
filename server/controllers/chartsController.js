// controllers/summaryController.js
import Summary from "../models/Summary.js";
import Activity from "../models/Activity.js";

// --- Helpers ---
const formatTime = (minutes) => {
  const h = String(Math.floor(minutes / 60)).padStart(2, "0");
  const m = String(minutes % 60).padStart(2, "0");
  return `${h}:${m}`;
};

// Compress per-minute data into intervals
const compressToIntervals = (perMinuteData, lastActivityFromPrevDay = "others") => {
  const summary = [];
  let currentActivity = lastActivityFromPrevDay;
  let intervalStart = "00:00";

  for (let i = 0; i < perMinuteData.length; i++) {
    const entry = perMinuteData[i];
    const nextActivity = entry.distribution
      ? Object.keys(entry.distribution)[0]
      : currentActivity;

    if (nextActivity !== currentActivity) {
      // close previous interval
      summary.push({
        activity: currentActivity,
        intervals: [{ start: intervalStart, end: entry.time }],
      });
      currentActivity = nextActivity;
      intervalStart = entry.time;
    }
  }

  // close final interval
  summary.push({
    activity: currentActivity,
    intervals: [{ start: intervalStart, end: "23:59" }],
  });

  return summary;
};

// --- Controller ---
export const getDailySummary = async (req, res) => {
  try {
    const userId = req.user._id;
    const { date } = req.query; // "YYYY-MM-DD"
    const dayStart = new Date(date);
    dayStart.setHours(0, 0, 0, 0);
    const dayEnd = new Date(dayStart);
    dayEnd.setHours(23, 59, 59, 999);

    // Check if summary already exists
    let summaryDoc = await Summary.findOne({
      user: userId,
      type: "day",
      startDate: dayStart,
    });

    // Fetch activities for today
    const activities = await Activity.find({
      user: userId,
      date: { $gte: dayStart, $lte: dayEnd },
    }).sort({ date: 1 });

    // Fetch last activity from previous day
    const prevActivityDoc = await Activity.findOne({
      user: userId,
      date: { $lt: dayStart },
    }).sort({ date: -1 });

    const lastActivityFromPrevDay = prevActivityDoc ? prevActivityDoc.activity : "others";

    // Build per-minute data
    const perMinuteData = [];
    let actIdx = 0;
    let lastActivity = lastActivityFromPrevDay;

    for (let i = 0; i < 1440; i++) {
      const currentTime = new Date(dayStart.getTime() + i * 60000);

      // Update lastActivity if a new activity occurred
      while (actIdx < activities.length && activities[actIdx].date <= currentTime) {
        lastActivity = activities[actIdx].activity;
        actIdx++;
      }

      perMinuteData.push({
        time: formatTime(i),
        distribution: { [lastActivity]: 1 },
      });
    }

    // Compress into intervals
    const compressedSummary = compressToIntervals(perMinuteData, lastActivityFromPrevDay);

    // If no summary existed, create it
    if (!summaryDoc) {
      summaryDoc = await Summary.create({
        user: userId,
        type: "day",
        startDate: dayStart,
        endDate: dayEnd,
        summary: perMinuteData, // store raw per-minute data for caching
      });
    }

    // Respond with compressed version for frontend
    res.json({
      user: userId,
      type: "day",
      date,
      summary: compressedSummary,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};

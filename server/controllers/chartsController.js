// controllers/summaryController.js
import Summary from "../models/Summary.js";
import Activity from "../models/Activity.js";

// --- Helpers ---
const formatTime = (minutes) => {
  const h = String(Math.floor(minutes / 60)).padStart(2, "0");
  const m = String(minutes % 60).padStart(2, "0");
  return `${h}:${m}`;
};

// Build intervals from activities
const buildIntervals = (activities, lastActivityFromPrevDay = "others", dayStart) => {
  const summaryMap = {};
  let lastActivity = lastActivityFromPrevDay;
  let intervalStart = "00:00";

  dayStart = new Date(dayStart);

  for (let i = 0; i <= activities.length; i++) {
    const act = activities[i];

    // Determine interval end
    let intervalEnd;
    if (i < activities.length) {
      const actDate = new Date(act.date);
      const diffMinutes = Math.floor((actDate - dayStart) / 60000);
      intervalEnd = formatTime(diffMinutes >= 0 ? diffMinutes : 0);
    } else {
      intervalEnd = "23:59";
    }

    if (!summaryMap[lastActivity]) summaryMap[lastActivity] = [];
    summaryMap[lastActivity].push({ start: intervalStart, end: intervalEnd });

    if (i < activities.length) {
      lastActivity = act.activity;
      intervalStart = intervalEnd;
    }
  }

  // Convert map to array
  return Object.keys(summaryMap).map((act) => ({
    activity: act,
    intervals: summaryMap[act],
  }));
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

    // If summary doesn't exist, create and store raw activities
    if (!summaryDoc) {
      summaryDoc = await Summary.create({
        user: userId,
        type: "day",
        startDate: dayStart,
        endDate: dayEnd,
        summary: activities, // store raw activities for caching
      });
    }

    // Build intervals for frontend
    const intervalsSummary = buildIntervals(activities, lastActivityFromPrevDay, dayStart);

    res.json({
      user: userId,
      type: "day",
      date,
      summary: intervalsSummary,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};

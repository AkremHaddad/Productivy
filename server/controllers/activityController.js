import Activity from "../models/Activity.js";
import CurrentActivity from "../models/CurrentActivity.js";
import ProductiveTime from "../models/ProductiveTime.js";
import User from "../models/User.js";

// export const addActivityMinute = async (req, res) => {
//   try {
//     const userId = req.user._id;

//     const current = await CurrentActivity.findOne({ user: userId });

//     // ✅ Only proceed if user is online and has a valid activity
//     if (!current?.activity || !current.isOnline) {
//       return res.status(400).json({ message: "User offline or no activity set" });
//     }

//     const now = new Date();

//     // ✅ Optional: check lastSeen (inactive users don't get minutes)
//     // const lastSeenDiff = now - current.lastSeen; // in ms
//     // if (lastSeenDiff > 2 * 60 * 1000) {
//     //   return res.status(400).json({ message: "User inactive recently" });
//     // }

//     const day = `${now.getFullYear()}-${now.getMonth() + 1}-${now.getDate()}`;
//     const hour = now.getHours();
//     const activity = current.activity;

//     // ✅ Increment the activity count in Activity collection
//     const updatedActivity = await Activity.findOneAndUpdate(
//       { user: userId, day },
//       { $inc: { [`hours.${hour}.${activity}`]: 1 } },
//       { upsert: true, new: true }
//     );

//     // ✅ If activity is "working", also update ProductiveTime
//     if (activity.toLowerCase() === "working") {
//     // Use start-of-day ISO string for consistency
//     const today = new Date();
//     today.setHours(0, 0, 0, 0);

//     await ProductiveTime.findOneAndUpdate(
//       { 
//         user: userId, 
//         date: today, 
//       },
//       { $inc: { minutes: 1 } },
//       { new: true, upsert: true, setDefaultsOnInsert: true }
//     );
//   }


//     res.json({ success: true, record: updatedActivity });
//   } catch (err) {
//     console.error("❌ Cron addActivityMinute error:", err);
//     res.status(500).json({ message: err.message });
//   }
// };


// Set current activity from UI
export const setCurrentActivity = async (req, res) => {
  try {
    const userId = req.user._id;
    const { activity } = req.body;

    if (!activity) return res.status(400).json({ message: "Activity required" });

    const record = await CurrentActivity.findOneAndUpdate(
      { user: userId },
      { activity, isOnline: true, lastSeen: new Date() },
      { upsert: true, new: true }
    );

    res.json({ success: true, activity: record.activity });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to update activity" });
  }
};

// Get the user's current activity
export const getCurrentActivity = async (req, res) => {
  try {
    const userId = req.user._id;
    const record = await CurrentActivity.findOne({ user: userId });

    res.json({ activity: record?.activity || "working", isOnline: record?.isOnline || false });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch current activity" });
  }
};

export const setOffline = async (req, res) => {
  try {
    const userId = req.user._id;

    await CurrentActivity.findOneAndUpdate(
      { user: userId },
      { isOnline: false }
    );

    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to set offline" });
  }
};

// Mark user online (heartbeat)
export const setOnline = async (req, res) => {
  try {
    const userId = req.user._id;
    const { activity } = req.body;

    if (!activity) return res.status(400).json({ message: "Activity required" });

    const record = await CurrentActivity.findOneAndUpdate(
      { user: userId },
      { isOnline: true, activity, lastSeen: new Date() },
      { upsert: true, new: true }
    );

    res.json({ success: true, activity: record.activity });
  } catch (err) {
    console.error("❌ Error setting online:", err);
    res.status(500).json({ message: "Failed to mark online" });
  }
};

// GET today's productive minutes
export const getTodayProductiveTime = async (req, res) => {
  try {
    const userId = req.user._id;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let record = await ProductiveTime.findOne({ user: userId, date: today });
    if (!record) {
      record = await ProductiveTime.create({ user: userId, date: today, minutes: 0 });
    }

    res.json({ minutes: record.minutes });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET consecutive days worked (ProductiveTime.minutes > 0), walking
// backwards from today. If today has no minutes yet, that's not a break
// in the streak - it just isn't counted until the user actually works.
export const getStreak = async (req, res) => {
  try {
    const userId = req.user._id;
    const cursor = new Date();
    cursor.setHours(0, 0, 0, 0);

    const todayRecord = await ProductiveTime.findOne({ user: userId, date: cursor });
    if (!todayRecord || todayRecord.minutes <= 0) {
      cursor.setDate(cursor.getDate() - 1);
    }

    let streak = 0;
    // Sanity cap so a data anomaly can't turn this into a runaway loop.
    while (streak < 3650) {
      const record = await ProductiveTime.findOne({ user: userId, date: cursor });
      if (!record || record.minutes <= 0) break;
      streak += 1;
      cursor.setDate(cursor.getDate() - 1);
    }

    res.json({ streak });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET the last N days of worked minutes (oldest first), for the dashboard
// heatmap/sparkline.
export const getHeatmap = async (req, res) => {
  try {
    const userId = req.user._id;
    const days = Math.min(Math.max(parseInt(req.query.days, 10) || 7, 1), 90);

    const start = new Date();
    start.setHours(0, 0, 0, 0);
    start.setDate(start.getDate() - (days - 1));

    const records = await ProductiveTime.find({ user: userId, date: { $gte: start } });
    const byDate = new Map(records.map((r) => [r.date.getTime(), r.minutes]));

    const result = [];
    const cursor = new Date(start);
    for (let i = 0; i < days; i++) {
      result.push({ date: cursor.toISOString(), minutes: byDate.get(cursor.getTime()) || 0 });
      cursor.setDate(cursor.getDate() + 1);
    }

    res.json(result);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET all-time total focus minutes, for the dashboard "Milestones" panel
export const getTotalFocusMinutes = async (req, res) => {
  try {
    const userId = req.user._id;
    const [agg] = await ProductiveTime.aggregate([
      { $match: { user: userId } },
      { $group: { _id: null, total: { $sum: "$minutes" } } },
    ]);

    res.json({ totalMinutes: agg?.total || 0 });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET the user's daily focus goal (minutes)
export const getGoal = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("dailyGoalMinutes");
    res.json({ dailyGoalMinutes: user?.dailyGoalMinutes ?? 360 });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// PATCH the user's daily focus goal (minutes)
export const setGoal = async (req, res) => {
  try {
    const minutes = Number(req.body.dailyGoalMinutes);
    if (!Number.isFinite(minutes) || minutes < 15 || minutes > 24 * 60) {
      return res.status(400).json({ message: "dailyGoalMinutes must be between 15 and 1440" });
    }

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { dailyGoalMinutes: minutes },
      { new: true }
    ).select("dailyGoalMinutes");

    res.json({ dailyGoalMinutes: user.dailyGoalMinutes });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

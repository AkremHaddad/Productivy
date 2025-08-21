import Activity from "../models/Activity.js";
import User from "../models/User.js";

// Helper to truncate date to minute
const truncateToMinute = (date) => {
  return new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate(),
    date.getHours(),
    date.getMinutes()
  );
};

// @desc Add or update activity for the current minute
export const addActivity = async (req, res) => {
  try {
    const userId = req.user._id;
    const { activity } = req.body;

    if (!activity) return res.status(400).json({ message: "Activity required" });

    const date = truncateToMinute(new Date());

    // Upsert: create or update existing minute record
    const record = await Activity.findOneAndUpdate(
      { user: userId, date },
      { activity },
      { upsert: true, new: true }
    );

    res.json({ success: true, activity: record.activity, date: record.date });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc Get latest activity of the user
export const getCurrentActivity = async (req, res) => {
  try {
    const userId = req.user._id;

    const latest = await Activity.findOne({ user: userId })
      .sort({ date: -1 });

    res.json({ activity: latest?.activity || "" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc Cleanup old activities older than 4 weeks
export const cleanupOldActivities = async () => {
  try {
    const fourWeeksAgo = new Date(Date.now() - 28 * 24 * 60 * 60 * 1000);
    await Activity.deleteMany({ date: { $lt: fourWeeksAgo } });
    console.log("Old activities cleaned up");
  } catch (err) {
    console.error("Cleanup failed:", err.message);
  }
};

export const getTodayProductiveTime = async (req, res) => {
  try {
    const { userId } = req.params;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const record = await ProductiveTime.findOne({ user: userId, date: today });

    if (!record) {
      return res.json({ hours: 0, minutes: 0 });
    }

    const hours = Math.floor(record.minutes / 60);
    const minutes = record.minutes % 60;

    res.json({ hours, minutes });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch productive time" });
  }
};




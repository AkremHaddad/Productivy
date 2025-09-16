import Activity from "../models/Activity.js";
import CurrentActivity from "../models/CurrentActivity.js";

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

    res.json({ activity: record?.activity || "working" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch current activity" });
  }
};

// Add +1 minute to the current activity (called by cron)
export const addActivityMinute = async (req, res) => {
  try {
    const userId = req.user._id;

    const current = await CurrentActivity.findOne({ user: userId });
    if (!current?.activity) {
      return res.status(400).json({ message: "No current activity set" });
    }

    const now = new Date();
    const day = `${now.getFullYear()}-${now.getMonth() + 1}-${now.getDate()}`;
    const hour = now.getHours();
    const activity = current.activity;

    const updated = await Activity.findOneAndUpdate(
      { user: userId, day, hour },
      { $inc: { [`activities.${activity}`]: 1 } },
      { upsert: true, new: true }
    );

    res.json({ success: true, record: updated });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
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

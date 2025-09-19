import Activity from "../models/Activity.js";
import CurrentActivity from "../models/CurrentActivity.js";
import ProductiveTime from "../models/ProductiveTime.js";

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

    res.json({ activity: record?.activity || "working" });
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

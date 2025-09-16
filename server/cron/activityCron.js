import cron from "node-cron";
import CurrentActivity from "../models/CurrentActivity.js";
import Activity from "../models/Activity.js";

// Run every minute
cron.schedule("* * * * *", async () => {
  console.log("⏳ Heartbeat running...");

  try {
    const onlineUsers = await CurrentActivity.find({ isOnline: true });
    console.log(`${onlineUsers.length} online users`);

    const now = new Date();

    for (const user of onlineUsers) {
      const lastSeenDiff = now - user.lastSeen; // in ms
      if (lastSeenDiff > 2 * 60 * 1000) continue; // skip if inactive >2min

      const dayKey = `${now.getFullYear()}-${now.getMonth() + 1}-${now.getDate()}`;
      const hourKey = now.getHours().toString(); // Map key must be string
      const activity = user.activity;

      if (!activity) continue;

      await Activity.findOneAndUpdate(
        { user: user.user, day: dayKey },
        { $inc: { [`hours.${hourKey}.${activity}`]: 1 } },
        { upsert: true, new: true }
      );
    }

    console.log("✅ Heartbeat processed");
  } catch (err) {
    console.error("❌ Cron heartbeat error:", err.message);
  }
});

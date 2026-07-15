import cron from "node-cron";
import CurrentActivity from "../models/CurrentActivity.js";
import Activity from "../models/Activity.js";
import ProductiveTime from "../models/ProductiveTime.js";

// Cap how much elapsed time a single tick can credit. Ticks normally run
// every 60s; this allows a little slack for jitter/delay but prevents a
// missed cron run (server restart, cold start, downtime) from silently
// crediting a huge multi-minute/hour gap once it resumes.
const MAX_CREDIT_MS = 90 * 1000;

// Run every minute
cron.schedule("* * * * *", async () => {
  console.log("⏳ Heartbeat running...");

  try {
    const now = new Date();

    // Get all online users
    const onlineUsers = await CurrentActivity.find({ isOnline: true });
    console.log(`${onlineUsers.length} online users`);

    for (const user of onlineUsers) {
      const lastSeenDiff = now - user.lastSeen; // in ms
      if (lastSeenDiff > 2 * 60 * 1000) continue; // skip if inactive > 2 min

      const activity = user.activity;
      if (!activity) continue;

      // Elapsed-time-based accounting: credit the real time since we last
      // accounted for this user, not a flat 1 minute per tick. This fixes
      // drift from delayed/missed ticks (previously silently lost, never
      // reconciled) and from the cron itself not running at exactly 60s
      // intervals. First tick after coming online has no prior
      // lastAccountedAt — bootstrap it and credit 0 rather than guessing.
      if (!user.lastAccountedAt) {
        user.lastAccountedAt = now;
        await user.save();
        continue;
      }

      const elapsedMs = Math.min(
        now - user.lastAccountedAt,
        MAX_CREDIT_MS
      );
      const elapsedMinutes = elapsedMs / 60000;
      if (elapsedMinutes <= 0) continue;

      // Day/hour bucketing intentionally left as server-local time, matching
      // the convention already used consistently across activityController.js
      // and chartsController.js (today's productive time, weekly/daily
      // charts). Standardizing this to UTC or a per-user timezone would need
      // to change all three together to avoid a reads-vs-writes mismatch —
      // out of scope for this pass; flagged as a follow-up in CLAUDE.md.
      const dayKey = `${now.getFullYear()}-${now.getMonth() + 1}-${now.getDate()}`;
      const hourKey = now.getHours().toString(); // Map key must be string

      // 1️⃣ Increment hourly Activity by the real elapsed minutes
      await Activity.findOneAndUpdate(
        { user: user.user, day: dayKey },
        { $inc: { [`hours.${hourKey}.${activity}`]: elapsedMinutes } },
        { upsert: true, new: true }
      );

      // 2️⃣ Increment total productive time if activity is 'working'
      if (activity === "working") {
        const todayDate = new Date();
        todayDate.setHours(0, 0, 0, 0); // normalize date

        await ProductiveTime.findOneAndUpdate(
          { user: user.user, date: todayDate },
          { $inc: { minutes: elapsedMinutes } },
          { upsert: true, new: true }
        );
      }

      user.lastAccountedAt = now;
      await user.save();
    }

    console.log("✅ Heartbeat processed");
  } catch (err) {
    console.error("❌ Cron heartbeat error:", err.message);
  }
});

import Event from "../models/Event.js";

// GET most recent events for the dashboard "Today's recap" card
export const getEvents = async (req, res) => {
  try {
    const limit = Math.min(parseInt(req.query.limit, 10) || 10, 50);
    const events = await Event.find({ user: req.user.id })
      .sort({ createdAt: -1 })
      .limit(limit);

    res.json(events);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET today's event counts by type, for the dashboard's "Today" stat row.
// A dedicated aggregate rather than filtering the recap list client-side -
// today could easily have more events than the recap's own limit.
export const getTodayEventCounts = async (req, res) => {
  try {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const rows = await Event.aggregate([
      { $match: { user: req.user._id, createdAt: { $gte: startOfDay } } },
      { $group: { _id: "$type", count: { $sum: 1 } } },
    ]);

    const counts = { sprint_started: 0, sprint_completed: 0, task_completed: 0 };
    rows.forEach((r) => {
      if (r._id in counts) counts[r._id] = r.count;
    });

    res.json(counts);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

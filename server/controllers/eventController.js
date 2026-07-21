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

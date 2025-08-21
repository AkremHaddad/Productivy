import ProductiveTime from "../models/ProductiveTime.js";

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

// POST add a minute
export const addMinute = async (req, res) => {
  try {
    const userId = req.user._id;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const record = await ProductiveTime.findOneAndUpdate(
      { user: userId, date: today },
      { $inc: { minutes: 1 } },
      { new: true, upsert: true }
    );

    res.json({ minutes: record.minutes });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

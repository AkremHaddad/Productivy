// controllers/activityController.js
import Activity from "../models/Activity.js";
import WeeklySummary from "../models/WeeklySummary.js";

const normalizeHoursMap = (hoursMap = {}) => {
  const result = {};
  // If it's a Map (rare when using .lean(), but safe)
  if (typeof hoursMap.get === "function") {
    for (let h = 0; h < 24; h++) {
      const key = String(h);
      const val = hoursMap.get(key);
      result[key] = val ? val : {};
    }
    return result;
  }

  // If it's a plain object
  for (let h = 0; h < 24; h++) {
    const key = String(h);
    // support either numeric keys or string keys
    const val = hoursMap?.[key] ?? hoursMap?.[Number(key)];
    result[key] = val ? val : {};
  }
  return result;
};

// convert padded date like "2025-09-19" -> unpadded "2025-9-19"
const unpadDateString = (isoDate) => {
  if (!isoDate) return isoDate;
  const [y, m, d] = isoDate.split("-");
  return `${y}-${String(Number(m))}-${String(Number(d))}`;
};

// GET /api/charts/daily?date=YYYY-MM-DD
export const getDailySummary = async (req, res) => {
  try {
    const userId = req.user._id;
    const { date } = req.query;

    if (!date) return res.status(400).json({ error: "date query param required (YYYY-MM-DD)" });

    // Try exact match first (frontend sends padded YYYY-MM-DD)
    let doc = await Activity.findOne({ user: userId, day: date }).lean();

    // If not found, try unpadded form (YYYY-M-D)
    if (!doc) {
      const unpadded = unpadDateString(date);
      if (unpadded !== date) {
        doc = await Activity.findOne({ user: userId, day: unpadded }).lean();
      }
    }

    // If still not found, return 24 empty hours
    if (!doc) {
      const emptyHours = {};
      for (let h = 0; h < 24; h++) emptyHours[String(h)] = {};
      return res.json({ user: userId, day: date, hours: emptyHours });
    }

    // Normalize hours map to plain object with keys "0".."23"
    const hours = normalizeHoursMap(doc.hours);

    return res.json({
      _id: doc._id,
      user: doc.user,
      day: doc.day,
      hours,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    });
  } catch (err) {
    console.error("❌ getDailySummary error:", err);
    return res.status(500).json({ error: "Server error" });
  }
};

const pad2 = (n) => String(n).padStart(2, "0");

// format date -> YYYY-MM-DD (zero-padded)
const formatDatePadded = (date) => {
  return `${date.getFullYear()}-${pad2(date.getMonth() + 1)}-${pad2(date.getDate())}`;
};

// convert possibly-unpadded day string 'YYYY-M-D' or padded 'YYYY-MM-DD' to padded form
const normalizeDayString = (dayStr) => {
  if (!dayStr) return dayStr;
  const parts = dayStr.split("-");
  if (parts.length !== 3) return dayStr;
  const [y, m, d] = parts;
  return `${y}-${pad2(Number(m))}-${pad2(Number(d))}`;
};

// given any date-string, return Monday date object of that week (Mon = start)
const getWeekStart = (dateStr) => {
  const date = new Date(dateStr);
  const day = date.getDay(); // Sunday = 0, Monday = 1
  const diff = day === 0 ? -6 : 1 - day; // move to Monday
  const monday = new Date(date);
  monday.setDate(date.getDate() + diff);
  monday.setHours(0, 0, 0, 0);
  return monday;
};

// convert doc.hours (Map or object) -> plain object with string keys
const hoursToPlainObject = (hoursField) => {
  if (!hoursField) return {};
  // If it's a Map-like (has get/entries)
  if (typeof hoursField.get === "function" || typeof hoursField.entries === "function") {
    return Object.fromEntries(hoursField.entries ? hoursField.entries() : hoursField);
  }
  // plain object already
  return hoursField;
};

/* ---------- Controller ---------- */

// GET /api/charts/weekly?date=YYYY-MM-DD   (date can be any day within the week)
export const getWeeklySummary = async (req, res) => {
  try {
    const userId = req.user._id;
    const { date } = req.query;
    if (!date) return res.status(400).json({ error: "Date is required" });

    // compute week start (Monday) and week end (Sunday), and padded strings
    const weekStartDate = getWeekStart(date);
    const weekEndDate = new Date(weekStartDate);
    weekEndDate.setDate(weekEndDate.getDate() + 6);
    const weekStartStr = formatDatePadded(weekStartDate);
    const weekEndStr = formatDatePadded(weekEndDate);

    // check if current week
    const today = new Date();
    const thisWeekMonday = getWeekStart(today.toISOString().split("T")[0]);
    const isCurrentWeek = weekStartDate.getTime() === thisWeekMonday.getTime();

    // fetch cached summary (only use if not current week)
    let cached = await WeeklySummary.findOne({ user: userId, weekStart: weekStartStr }).lean();
    if (cached && !isCurrentWeek) return res.json(cached);

    // fetch daily activities for the week
    const daysSet = new Set();
    for (let i = 0; i < 7; i++) {
      const d = new Date(weekStartDate);
      d.setDate(d.getDate() + i);
      daysSet.add(formatDatePadded(d));
      daysSet.add(`${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`);
    }
    const daysList = Array.from(daysSet);

    const rawDailyDocs = await Activity.find({
      user: userId,
      day: { $in: daysList },
    }).lean();

    const docsByDay = {};
    for (const doc of rawDailyDocs) {
      docsByDay[normalizeDayString(doc.day)] = doc;
    }

    // aggregate per hour
    const hourSums = {};
    for (let h = 0; h < 24; h++) hourSums[String(h)] = {};

    for (let dayOffset = 0; dayOffset < 7; dayOffset++) {
      const d = new Date(weekStartDate);
      d.setDate(d.getDate() + dayOffset);
      const dayStr = formatDatePadded(d);
      const doc = docsByDay[dayStr];
      const dayHours = doc ? hoursToPlainObject(doc.hours) : {};
      for (let h = 0; h < 24; h++) {
        const hourKey = String(h);
        const hourData = dayHours[hourKey] || {};
        for (const [act, mins] of Object.entries(hourData)) {
          const add = Number(mins) || 0;
          if (!hourSums[hourKey][act]) hourSums[hourKey][act] = 0;
          hourSums[hourKey][act] += add;
        }
      }
    }

    // compute averages
    const daysCount = 7;
    const hourAverages = {};
    for (let h = 0; h < 24; h++) {
      const hourKey = String(h);
      hourAverages[hourKey] = {};
      const acts = hourSums[hourKey];
      for (const [act, totalMins] of Object.entries(acts)) {
        const avg = Math.round(totalMins / daysCount);
        if (avg > 0) hourAverages[hourKey][act] = avg;
      }
    }

    // ensure all hours exist
    for (let h = 0; h < 24; h++) {
      if (!hourAverages[String(h)]) hourAverages[String(h)] = {};
    }

    // upsert summary (past weeks cached, current week always updated)
    const saved = await WeeklySummary.findOneAndUpdate(
      { user: userId, weekStart: weekStartStr },
      { $set: { hours: hourAverages, weekEnd: weekEndStr } },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    ).lean();

    return res.json(saved);
  } catch (err) {
    console.error("❌ getWeeklySummary error:", err);
    return res.status(500).json({ error: "Server error" });
  }
};
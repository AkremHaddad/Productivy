// Rounds to whole minutes before formatting - activity minutes are stored
// as fractional floats (server/cron/activityCron.js credits real elapsed
// time), so this is what keeps "47.383333...m" from ever hitting the UI.
export const formatTime = (totalMinutes) => {
  const rounded = Math.round(totalMinutes);
  const h = Math.floor(rounded / 60);
  const m = rounded % 60;
  if (h > 0 && m > 0) return `${h}h ${m}m`;
  if (h > 0) return `${h}h`;
  return `${m}m`;
};

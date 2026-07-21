import Event from "../models/Event.js";

// Best-effort event log write — swallows errors so a logging failure
// never breaks the primary action (task toggle, card move, etc.) that
// triggered it.
export const logEvent = async ({ user, project, type, message }) => {
  try {
    await Event.create({ user, project, type, message });
  } catch (err) {
    console.error("⚠️ Failed to log event", type, err.message);
  }
};

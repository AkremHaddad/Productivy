// Collapsed to working/off (matches CurrentActivity's enum). Historical
// Activity documents can still contain the older, richer category set from
// before this change - LEGACY_COLOR is the fallback for any of those so old
// bars render as a neutral color instead of disappearing.
export const activities = ["working", "off"];

export const activityColors = {
  working: "#4f46e5",
  off: "#6b7280",
};

export const LEGACY_COLOR = "#9ca3af";



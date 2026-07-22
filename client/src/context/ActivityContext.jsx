import React, { useState, useEffect, useRef } from "react";
import API from "../api/API";
import { ActivityContext } from "./activityContextInstance";

// Single source of truth for "current activity" (working/off), online
// presence, and today's live-ticking minutes-worked count. Used to live in
// Status.jsx alone, mounted only inside the Project page's Tools panel - so
// the 30s online heartbeat and the minute ticker silently didn't run
// anywhere else. Now that a status pill lives in the global Navbar (present
// on every route, including the logged-out landing page), this needs to be
// a single provider mounted once, not duplicated per-consumer.
const normalizeActivity = (act) => (act === "working" ? "working" : "off");

export const ActivityProvider = ({ children }) => {
  // null = not checked yet, false = confirmed logged out, true = logged in
  const [authenticated, setAuthenticated] = useState(null);
  const [currentActivity, setCurrentActivity] = useState("");
  const [loading, setLoading] = useState(false);
  const [minutesWorkedToday, setMinutesWorkedToday] = useState(0);

  const timeoutRef = useRef(null);
  const intervalRef = useRef(null);
  const lastTickRef = useRef(new Date());

  // Fetch latest activity on mount. A 401 here means there's no session -
  // Navbar renders on the public landing page too, so this has to fail
  // quietly instead of defaulting to "working" and starting a heartbeat
  // for a visitor who was never logged in.
  useEffect(() => {
    const fetchActivity = async () => {
      try {
        const res = await API.get("/api/activity/current", { withCredentials: true });
        setCurrentActivity(normalizeActivity(res.data?.activity || "working"));
        setAuthenticated(true);
      } catch (err) {
        if (err.response?.status === 401) {
          setAuthenticated(false);
        } else {
          console.error("❌ Error fetching current activity:", err);
          setCurrentActivity("working");
          setAuthenticated(true);
        }
      }
    };
    fetchActivity();
  }, []);

  // Seed today's minutes once we know there's a real session.
  useEffect(() => {
    if (!authenticated) return;
    const fetchMinutesWorked = async () => {
      try {
        const res = await API.get("/api/activity/today", { withCredentials: true });
        setMinutesWorkedToday(res.data?.minutes || 0);
      } catch (err) {
        console.error("❌ Failed to fetch minutes worked:", err);
      }
    };
    fetchMinutesWorked();
  }, [authenticated]);

  // Heartbeat: mark online every 30s while there's a real session.
  useEffect(() => {
    if (!authenticated || !currentActivity) return;

    const markOnline = async () => {
      try {
        await API.post(
          "/api/activity/set-online",
          { activity: currentActivity },
          { withCredentials: true }
        );
      } catch (err) {
        console.error("❌ Error marking online:", err);
      }
    };

    markOnline();
    const hb = setInterval(markOnline, 30000);
    return () => clearInterval(hb);
  }, [authenticated, currentActivity]);

  // Mark offline on unload.
  useEffect(() => {
    if (!authenticated) return;
    const goOffline = async () => {
      try {
        await API.post("/api/activity/set-offline", {}, { withCredentials: true });
      } catch (err) {
        console.error("❌ Error marking offline:", err);
      }
    };

    window.addEventListener("beforeunload", goOffline);
    return () => window.removeEventListener("beforeunload", goOffline);
  }, [authenticated]);

  // Live per-minute increment of minutesWorkedToday while working (catches
  // up if the tab was inactive past a minute boundary).
  useEffect(() => {
    const clearTimers = () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };

    clearTimers();

    if (!authenticated || currentActivity !== "working") {
      return () => clearTimers();
    }

    const nowStart = new Date();
    lastTickRef.current = new Date(
      nowStart.getFullYear(),
      nowStart.getMonth(),
      nowStart.getDate(),
      nowStart.getHours(),
      nowStart.getMinutes(),
      0,
      0
    );

    const tick = () => {
      const now = new Date();
      const diffMs = now.getTime() - lastTickRef.current.getTime();
      const diffMinutes = Math.floor(diffMs / 60000);
      const minutesToAdd = Math.max(1, diffMinutes);

      setMinutesWorkedToday((prev) => prev + minutesToAdd);

      lastTickRef.current = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate(),
        now.getHours(),
        now.getMinutes(),
        0,
        0
      );
    };

    const schedule = () => {
      const now = new Date();
      const msToNextFullMinute = (60 - now.getSeconds()) * 1000 - now.getMilliseconds();

      timeoutRef.current = setTimeout(() => {
        tick();
        intervalRef.current = setInterval(tick, 60000);
        timeoutRef.current = null;
      }, msToNextFullMinute);
    };

    schedule();
    return () => clearTimers();
  }, [authenticated, currentActivity]);

  // Flip working <-> off directly - only two states, a picker is overkill.
  const toggleActivity = async () => {
    const activity = currentActivity === "working" ? "off" : "working";
    const previousActivity = currentActivity;
    setCurrentActivity(activity);
    setLoading(true);

    try {
      await API.post("/api/activity/set", { activity }, { withCredentials: true });
    } catch (err) {
      console.error("❌ Error saving activity:", err.response?.data || err);
      setCurrentActivity(previousActivity);
      alert("Failed to update activity. Reverting to previous.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ActivityContext.Provider
      value={{
        authenticated,
        currentActivity,
        loading,
        minutesWorkedToday,
        toggleActivity,
      }}
    >
      {children}
    </ActivityContext.Provider>
  );
};

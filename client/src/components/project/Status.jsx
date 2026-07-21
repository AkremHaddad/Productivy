import React, { useState, useEffect, useRef } from "react";
import API from "../../api/API";

// Collapsed further to just working/off (feedback after real use: the
// in-between categories never got used). Any older multi-category value
// still sitting in the DB normalizes to "off" here rather than a migration -
// it gets overwritten the next time status changes anyway.
const normalizeActivity = (act) => (act === "working" ? "working" : "off");

const Status = ({ onMinutesUpdate }) => {
  const [currentActivity, setCurrentActivity] = useState("");
  const [loading, setLoading] = useState(false);

  const timeoutRef = useRef(null);
  const intervalRef = useRef(null);
  const lastTickRef = useRef(new Date()); // keep last increment timestamp

  // Fetch latest activity on mount
  useEffect(() => {
    const fetchActivity = async () => {
      try {
        const res = await API.get("/api/activity/current", { withCredentials: true });
        const act = normalizeActivity(res.data?.activity || "working");
        setCurrentActivity(act);
      } catch (err) {
        console.error("❌ Error fetching current activity:", err);
        setCurrentActivity("working");
      }
    };
    fetchActivity();
  }, []);

  // Heartbeat: mark online every 30s if activity exists
  useEffect(() => {
    const markOnline = async () => {
      if (!currentActivity) return;
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
  }, [currentActivity]);

  // Mark offline on unload
  useEffect(() => {
    const goOffline = async () => {
      try {
        await API.post("/api/activity/set-offline", {}, { withCredentials: true });
      } catch (err) {
        console.error("❌ Error marking offline:", err);
      }
    };

    window.addEventListener("beforeunload", goOffline);
    return () => window.removeEventListener("beforeunload", goOffline);
  }, []);

  // Productive time UI increment (catch up if tab inactive)
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

    if (currentActivity !== "working") {
      return () => clearTimers();
    }

    // snap lastTick to current minute boundary when starting
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

      // Ensure we always add at least 1 minute on the first aligned tick,
      // and catch up with multiple minutes if the tab was inactive.
      const minutesToAdd = Math.max(1, diffMinutes);

      if (typeof onMinutesUpdate === "function") {
        onMinutesUpdate((prev) => prev + minutesToAdd);
      }

      // snap lastTick to the exact minute boundary we just processed
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
        tick(); // guaranteed to add at least 1
        intervalRef.current = setInterval(tick, 60000);
        timeoutRef.current = null;
      }, msToNextFullMinute);
    };

    schedule();
      return () => clearTimers();
    }, [currentActivity, onMinutesUpdate]);


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

  const isWorking = currentActivity === "working";

  return (
    <div className="flex-1 flex bg-inherit h-[150px] border-x-[1px] border-border-light dark:border-border-dark">
      <button
        onClick={() => !loading && toggleActivity()}
        title="Click to toggle working / off"
        className="flex-1 flex flex-col justify-evenly items-center p-2 cursor-pointer"
      >
        <div className="font-normal text-md text-black dark:text-white text-center font-jaro">
          status
        </div>
        <div className="flex items-center gap-1.5">
          <span className={`w-1.5 h-1.5 rounded-full flex-none ${isWorking ? "bg-[#8B7CF6]" : "bg-secondary-dark"}`} />
          <span className="font-normal text-sm text-black dark:text-white text-center font-jaro capitalize">
            {loading ? "Saving..." : currentActivity || "No activity"}
          </span>
        </div>
      </button>
    </div>
  );
};

export default Status;

import React, { useState, useEffect, useRef } from "react";
import API from "../../api/API";

const activities = ["working", "learning", "training", "playing", "socializing", "off"];

// Old 8-category values collapse onto the new 6: sleeping+others -> off,
// hobbying -> playing. Handles records written before this change without
// a DB migration - they get overwritten the next time status changes.
const LEGACY_ACTIVITY_MAP = { sleeping: "off", others: "off", hobbying: "playing" };
const normalizeActivity = (act) => LEGACY_ACTIVITY_MAP[act] || act;

const ACTIVITY_DOT = {
  working: "bg-[#8B7CF6]",
  learning: "bg-[#3FCB6B]",
  training: "bg-amber",
  playing: "bg-[#E5484D]",
  socializing: "bg-[#D6538E]",
  off: "bg-secondary-dark",
};

const Status = ({ onMinutesUpdate }) => {
  const [currentActivity, setCurrentActivity] = useState("");
  const [showPopup, setShowPopup] = useState(false);
  const [loading, setLoading] = useState(false);

  const popoverRef = useRef(null);
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

  // Close popover on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target)) {
        setShowPopup(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
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


  // Handle activity change
  const saveActivity = async (activity) => {
    if (activity === currentActivity) {
      setShowPopup(false);
      return;
    }

    const previousActivity = currentActivity;
    setCurrentActivity(activity);
    setShowPopup(false);
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
    <div ref={popoverRef} className="relative flex-1 flex bg-inherit h-[150px] border-x-[1px] border-border-light dark:border-border-dark">
      {/* Status pill */}
      <button
        onClick={() => !loading && setShowPopup((prev) => !prev)}
        className="flex-1 flex flex-col justify-evenly items-center p-2 cursor-pointer"
      >
        <div className="font-normal text-md text-black dark:text-white text-center font-jaro">
          status
        </div>
        <div className="flex items-center gap-1.5">
          <span className={`w-1.5 h-1.5 rounded-full flex-none ${ACTIVITY_DOT[currentActivity] || "bg-secondary-dark"}`} />
          <span className="font-normal text-sm text-black dark:text-white text-center font-jaro capitalize">
            {loading ? "Saving..." : currentActivity || "No activity"}
          </span>
        </div>
      </button>

      {/* Popover - non-blocking, closes on outside click */}
      {showPopup && (
        <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 z-50 w-56 bg-header-light dark:bg-header-dark border-[1px] border-border-light dark:border-border-dark rounded-xl shadow-xl p-2 flex flex-wrap gap-1.5">
          {activities.map((act) => (
            <button
              key={act}
              disabled={loading}
              className={`flex items-center gap-1.5 rounded-full px-2.5 py-1.5 text-xs font-semibold capitalize transition-all ${
                currentActivity === act
                  ? "bg-black/10 dark:bg-white/10 border-[1px] border-black dark:border-white text-black dark:text-white"
                  : "border-[1px] border-transparent text-black dark:text-white hover:border-border-light dark:hover:border-border-dark"
              }`}
              onClick={() => saveActivity(act)}
            >
              <span className={`w-1.5 h-1.5 rounded-full flex-none ${ACTIVITY_DOT[act]}`} />
              {act}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default Status;

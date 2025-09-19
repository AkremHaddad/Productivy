import React, { useState, useEffect, useRef } from "react";
import API from "../../api/API";
import Modal from "../common/Modal";

const activities = [
  "working",
  "learning",
  "sleeping",
  "training",
  "playing",
  "socializing",
  "hobbying",
  "others",
];

const Status = ({ onMinutesUpdate }) => {
  const [currentActivity, setCurrentActivity] = useState("");
  const [showPopup, setShowPopup] = useState(false);
  const [loading, setLoading] = useState(false);

  // refs for the timeout + interval so we can clear both
  const timeoutRef = useRef(null);
  const intervalRef = useRef(null);

  // Fetch latest activity on mount
  useEffect(() => {
    const fetchActivity = async () => {
      try {
        const res = await API.get("/api/activity/current", { withCredentials: true });
        const act = res.data?.activity || "working";
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

  // Productive time UI increment: align to full minute (hh:mm:00)
  useEffect(() => {
    // clear any previous timers
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

    const tickOnceAndStartInterval = () => {
      // update UI by 1 minute (parent setter expected)
      try {
        if (typeof onMinutesUpdate === "function") {
          onMinutesUpdate((prev) => prev + 1);
        }
      } catch (e) {
        // if parent passed a non-setter, do a best-effort call
        try {
          onMinutesUpdate && onMinutesUpdate();
        } catch (_) {}
      }

      // start repeating every 60s on exact minute boundaries
      intervalRef.current = setInterval(() => {
        try {
          if (typeof onMinutesUpdate === "function") {
            onMinutesUpdate((prev) => prev + 1);
          }
        } catch (e) {
          try {
            onMinutesUpdate && onMinutesUpdate();
          } catch (_) {}
        }
      }, 60000);
    };

    // compute ms until next full minute (hh:mm:00)
    const now = new Date();
    const msToNextFullMinute = (60 - now.getSeconds()) * 1000 - now.getMilliseconds();

    // schedule first tick at the exact full minute, then interval runs every 60s
    timeoutRef.current = setTimeout(() => {
      tickOnceAndStartInterval();
      timeoutRef.current = null;
    }, msToNextFullMinute);

    // cleanup
    return () => clearTimers();
  }, [currentActivity, onMinutesUpdate]);

  // Handle activity change
  const saveActivity = async (activity) => {
    if (activity === currentActivity || loading) {
      setShowPopup(false);
      return;
    }

    setLoading(true);
    try {
      await API.post("/api/activity/set", { activity }, { withCredentials: true });
      setCurrentActivity(activity);
    } catch (err) {
      console.error("❌ Error saving activity:", err.response?.data || err);
    } finally {
      setLoading(false);
      setShowPopup(false);
    }
  };

  return (
    <>
      {/* Small Status Box */}
      <div
        id="Status"
        className="flex-1 flex flex-col justify-evenly items-center p-2 bg-inherit h-[150px] border-x-2 border-gray-400 dark:border-gray-700 cursor-pointer"
        onClick={() => !loading && setShowPopup(true)}
      >
        <div className="font-normal text-md text-white text-center font-jaro">
          status
        </div>
        <div className="font-normal text-md text-[#C3C3C3] text-center font-jaro">
          {loading ? "Saving..." : currentActivity || "No activity"}
        </div>
      </div>

      {/* Modal */}
      <Modal
        isOpen={showPopup}
        onClose={() => setShowPopup(false)}
        title="Set Your Activity"
      >
        <div className="grid grid-cols-2 gap-3">
          {activities.map((act) => (
            <button
              key={act}
              disabled={loading}
              className={`py-2 rounded-lg font-medium border-2 transition-all duration-200 ${
                currentActivity === act
                  ? "dark:border-accent border-black/30 bg-accent-light dark:bg-accent text-black"
                  : "dark:border-gray-400 bg-white dark:bg-navbar-dark text-text-light dark:text-text-dark hover:border-black dark:hover:border-accent"
              }`}
              onClick={() => saveActivity(act)}
            >
              {act.charAt(0).toUpperCase() + act.slice(1)}
            </button>
          ))}
        </div>

        <button
          className="mt-4 px-5 py-2 rounded-lg bg-navbar-light dark:bg-navbar-dark text-text-dark 
                     hover:bg-opacity-80 transition-all border border-transparent dark:hover:border-accent font-jaro font-medium"
          onClick={() => setShowPopup(false)}
          disabled={loading}
        >
          Cancel
        </button>
      </Modal>
    </>
  );
};

export default Status;

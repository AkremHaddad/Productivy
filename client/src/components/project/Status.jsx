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

  const timeoutRef = useRef(null);
  const intervalRef = useRef(null);
  const lastTickRef = useRef(new Date()); // keep last increment timestamp

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
      // Optionally, show an error message to the user
      alert("Failed to update activity. Reverting to previous.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Status Box */}
      <div
        id="Status"
        className="flex-1 flex flex-col justify-evenly items-center p-2 bg-inherit h-[150px] border-x-[1px] border-border-light dark:border-border-dark cursor-pointer"
        onClick={() => !loading && setShowPopup(true)}
      >
        <div className="font-normal text-md text-black dark:text-white text-center font-jaro">
          status
        </div>
        <div className="font-normal text-md text-black dark:text-white text-center font-jaro">
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
              className={`py-2 rounded-lg font-medium border-2  transition-all duration-200 text-black dark:text-white ${
                currentActivity === act
                  ? "dark:border-white border-black bg-black/10 dark:bg-white/10 "
                  : "   hover:border-black dark:hover:border-accent border-border-light dark:border-border-dark"
              }`}
              onClick={() => saveActivity(act)}
            >
              {act.charAt(0).toUpperCase() + act.slice(1)}
            </button>
          ))}
        </div>

        <button
          className="mt-4 px-5 py-2 rounded-lg bg-navbar-light dark:bg-navbar-dark text-black dark:text-white
                     hover:bg-opacity-80 transition-all 
                     border-[1px] border-border-light dark:border-border-dark  hover:border-black dark:hover:border-white
                      font-medium  hover:ring-2 hover:ring-black dark:hover:ring-white"
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
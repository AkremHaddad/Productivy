import React, { useState, useEffect } from "react";
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

const Status = () => {
  const [currentActivity, setCurrentActivity] = useState("");
  const [showPopup, setShowPopup] = useState(false);
  const [loading, setLoading] = useState(false);

  // ✅ Fetch latest activity on mount
  useEffect(() => {
    const fetchActivity = async () => {
      try {
        const res = await API.get("/api/activity/current", { withCredentials: true });
        setCurrentActivity(res.data?.activity || "working"); // default to "working"
      } catch (err) {
        console.error("❌ Error fetching current activity:", err);
        setCurrentActivity("working");
      }
    };

    fetchActivity();
  }, []);

  // ✅ Heartbeat: mark online every 30s
  useEffect(() => {
    const markOnline = async () => {
      try {
        await API.post(
          "/api/activity/set", // use existing endpoint
          { activity: currentActivity || "working" },
          { withCredentials: true }
        );
      } catch (err) {
        console.error("Error marking online:", err);
      }
    };

    // Call immediately and then every 30s
    markOnline();
    const interval = setInterval(markOnline, 30000);

    return () => clearInterval(interval);
  }, [currentActivity]);

  useEffect(() => {
    const goOffline = async () => {
      await API.post("/api/activity/set-offline", {}, { withCredentials: true });
    };
    window.addEventListener("beforeunload", goOffline);

    return () => window.removeEventListener("beforeunload", goOffline);
  }, []);

  // ✅ Handle activity change
  const saveActivity = async (activity) => {
    if (activity === currentActivity || loading) {
      setShowPopup(false);
      return;
    }

    setLoading(true);
    try {
      await API.post(
        "/api/activity/set",
        { activity },
        { withCredentials: true }
      );
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
        <div className="font-normal text-md text-white dark:text-white text-center font-jaro">
          status
        </div>
        <div className="font-normal text-md text-[#C3C3C3] dark:text-[#A6A6A6] text-center font-jaro">
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

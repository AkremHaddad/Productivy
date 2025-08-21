import React, { useState, useEffect } from "react";
import axios from "axios";

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
  const [currentActivity, setCurrentActivity] = useState("working");
  const [showPopup, setShowPopup] = useState(false);

  // Fetch latest activity on mount
  useEffect(() => {
    const fetchActivity = async () => {
      try {
        const res = await axios.get("/api/activity/current", { withCredentials: true });
        if (res.data?.activity) setCurrentActivity(res.data.activity);
      } catch (err) {
        console.error(err);
      }
    };
    fetchActivity();
  }, []);

  // Handle activity change
  const saveActivity = async (activity) => {
    // If user presses the same activity, just close popup
    if (activity === currentActivity) {
      setShowPopup(false);
      return;
    }

    // Close popup immediately
    setShowPopup(false);

    try {
      // Send update to backend
      await axios.post("/api/activity", { activity }, { withCredentials: true });
      setCurrentActivity(activity);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <>
      {/* Small Status Box */}
      <div
        id="Status"
        className="flex-1 bg-secondary-light dark:bg-secondary-dark h-[150px] rounded-md flex flex-col justify-between p-3 cursor-pointer"
        onClick={() => setShowPopup(true)}
      >
        <div className="font-normal text-xl text-white text-center font-jaro">status</div>
        <div className="font-normal text-md text-accent text-center font-jaro">{currentActivity}</div>
        <div className="flex justify-center">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            width={24}
            height={24}
            color={"#000000"}
            fill={"none"}
          >
            <path
              d="M15 9C15 7.34315 13.6569 6 12 6C10.3431 6 9 7.34315 9 9C9 10.6569 10.3431 12 12 12C13.6569 12 15 10.6569 15 9Z"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            ></path>
            <path
              d="M22 19C22 17.3431 20.6569 16 19 16C17.3431 16 16 17.3431 16 19C16 20.6569 17.3431 22 19 22C20.6569 22 22 20.6569 22 19Z"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            ></path>
            <path
              d="M21.8526 13.7202C21.9495 13.1613 22 12.5866 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22C12.5866 22 13.1613 21.9495 13.7202 21.8526"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            ></path>
            <path
              d="M7 17C7 14.2386 9.23858 12 12 12C13.5743 12 14.9786 12.7276 15.8951 13.8648"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            ></path>
          </svg>
        </div>
      </div>

      {/* Popup */}
     {showPopup && (
  <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 backdrop-blur-sm">
    <div className="bg-gray-300 dark:bg-background-dark p-6 rounded-xl shadow-2xl w-full max-w-md flex flex-col gap-4 border-2 border-secondary-dark dark:border-accent">
      
      <h2 className="text-2xl font-jaro font-bold text-center text-secondary-dark dark:text-accent">
        Set Your Activity
      </h2>

      <div className="grid grid-cols-2 gap-3">
        {activities.map((act) => (
          <button
            key={act}
            className={`py-2 rounded-lg font-medium border-2 transition-all duration-200 ${
              currentActivity === act
                ? "dark:border-accent border-secondary-dark bg-secondary-light dark:border-accent dark:bg-accent text-black"
                : "dark:border-gray-400 bg-ui-light dark:bg-navbar-dark text-text-light dark:text-text-dark dark:hover:border-accent hover:secondary-light hover:bg-secondary-light border-primary-dark hover:border-primary-light dark:hover:bg-gray-700 dark:hover:bg-gray-700"
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
      >
        Cancel
      </button>
      
    </div>
  </div>
)}

    </>
  );
};

export default Status;

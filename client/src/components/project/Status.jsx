import React, { useState, useEffect } from "react";
import API from "../../api/API";
import Modal from "../common/Modal"; // adjust path

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
        const res = await API.get("/api/activity/current", { withCredentials: true });
        if (res.data?.activity) setCurrentActivity(res.data.activity);
      } catch (err) {
        console.error(err);
      }
    };
    fetchActivity();
  }, []);

  // Handle activity change
  const saveActivity = async (activity) => {
    if (activity === currentActivity) {
      setShowPopup(false);
      return;
    }
    setShowPopup(false);
    try {
      await API.post("/api/activity", { activity }, { withCredentials: true });
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
        className="flex-1 flex flex-col justify-evenly items-center p-2 bg-inherit h-[150px] border-x-2 border-gray-400 dark:border-gray-700 cursor-pointer"
        onClick={() => setShowPopup(true)}
      >
        <div className="font-normal text-md text-white dark:text-white text-center font-jaro">
          status
        </div>
        <div className="font-normal text-md text-[#C3C3C3] dark:text-[#A6A6A6] text-center font-jaro">
          {currentActivity}
        </div>
        {/* <div className="flex justify-center">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            width={24}
            height={24}
            color={"#ffffff"}
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
        </div> */}
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
              className={`py-2 rounded-lg font-medium border-2 transition-all duration-200 ${
                currentActivity === act
                  ? "dark:border-accent border-black/30 bg-accent-light dark:border-accent dark:bg-accent text-black"
                  : "dark:border-gray-400 bg-white dark:bg-navbar-dark text-text-light dark:text-text-dark dark:hover:border-accent hover:secondary-light hover:bg-accent-light border-primary-dark hover:border-black dark:hover:bg-accent dark:hover:bg-gray-700"
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
      </Modal>
    </>
  );
};

export default Status;

import React from "react";
import { useActivity } from "../../api/useActivity";

// Thin display for the Project page's Tools panel. All the actual state
// (fetch, online heartbeat, offline-on-unload, minute ticker) now lives in
// ActivityContext, shared with the Navbar's status pill - see that file for
// why this moved out of here.
const Status = () => {
  const { currentActivity, loading, toggleActivity } = useActivity();
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

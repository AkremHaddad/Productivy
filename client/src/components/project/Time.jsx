import React, { useEffect, useState } from "react";
import API from "../../api/API";

const Time = () => {
  const [minutesWorked, setMinutesWorked] = useState(0);
  const [currentActivity, setCurrentActivity] = useState("working"); // track activity

  // Fetch productive time and current activity once on page load
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [timeRes, activityRes] = await Promise.all([
          API.get("/api/activity/today", { withCredentials: true }),
          API.get("/api/activity/current", { withCredentials: true }),
        ]);

        setMinutesWorked(timeRes.data.minutes || 0);
        setCurrentActivity(activityRes.data.activity || "working");
      } catch (err) {
        console.error("Fetch error:", err);
        setCurrentActivity("working");
      }
    };

    fetchData();
  }, []);

  // Increment UI every full minute if activity is "working"
  useEffect(() => {
    const tick = () => {
      const now = new Date();
      if (now.getSeconds() === 0 && currentActivity === "working") {
        setMinutesWorked((prev) => prev + 1);
      }
    };

    const interval = setInterval(tick, 1000); // check every second
    return () => clearInterval(interval);
  }, [currentActivity]); // re-run effect if activity changes

  // Listen for activity changes every 10s to keep currentActivity in sync
  useEffect(() => {
    const fetchActivity = async () => {
      try {
        const res = await API.get("/api/activity/current", { withCredentials: true });
        setCurrentActivity(res.data.activity || "working");
      } catch (err) {
        console.error("Error fetching activity:", err);
      }
    };

    const activityInterval = setInterval(fetchActivity, 10000); // poll every 10s
    return () => clearInterval(activityInterval);
  }, []);

  const formatTime = (totalMinutes) => {
    const h = Math.floor(totalMinutes / 60);
    const m = totalMinutes % 60;
    if (h > 0 && m > 0) return `${h}h ${m}m`;
    if (h > 0) return `${h}h`;
    return `${m}m`;
  };

  return (
    <div className="flex-1 flex flex-col justify-evenly items-center p-2 justify-around dark:bg-inherit h-[150px] rounded-r-md">
      <div className="font-jaro text-md text-white text-center">time worked today</div>
      <div className="font-jaro text-md text-[#C3C3C3] text-center">
        {formatTime(minutesWorked)}
      </div>
    </div>
  );
};

export default Time;

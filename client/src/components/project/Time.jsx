import React, { useEffect, useState, useRef } from "react";
import axios from "axios";

const Time = () => {
  const [minutesWorked, setMinutesWorked] = useState(0);
  const [isWorking, setIsWorking] = useState(false);
  const intervalRef = useRef(null);

  // Fetch today's productive minutes + current activity
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [timeRes, activityRes] = await Promise.all([
          axios.get("/api/productive-time/today", { withCredentials: true }),
          axios.get("/api/activity/current", { withCredentials: true }),
        ]);

        setMinutesWorked(timeRes.data.minutes || 0);
        setIsWorking(activityRes.data.activity === "working");
      } catch (err) {
        console.error("Fetch error:", err);
      }
    };

    fetchData();
  }, []);

  // Tick every minute if working
  useEffect(() => {
    if (!isWorking) return;

    intervalRef.current = setInterval(async () => {
      setMinutesWorked((prev) => prev + 1); // update UI

      // Send to backend
      try {
        console.log('test')
        await axios.post("/api/productive-time/add", {}, { withCredentials: true });
      } catch (err) {
        console.error("Add minute error:", err);
      }
    }, 60000); // 1 minute

    return () => clearInterval(intervalRef.current);
  }, [isWorking]);

  // Format hours + minutes (e.g., "2h 15m")
  const formatTime = (totalMinutes) => {
    const h = Math.floor(totalMinutes / 60);
    const m = totalMinutes % 60;

    if (h > 0 && m > 0) return `${h}h ${m}m`;
    if (h > 0) return `${h}h`;
    return `${m}m`;
  };

  return (
    <div
      id="Time"
      className="flex-1 justify-around bg-secondary-light dark:bg-secondary-dark h-[150px] rounded-md flex flex-col justify-between"
    >
      <div className="font-jaro text-md text-black dark:text-white text-center">
        time worked today
      </div>
      <div className="font-jaro text-md text-accent text-center">
        {formatTime(minutesWorked)}
      </div>
      <div className="flex justify-center max-h-[24px]">
        <img src="../worker.svg" alt="Worker" />
      </div>
    </div>
  );
};

export default Time;

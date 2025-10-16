import React, { useState, useEffect, useRef } from "react";
import Modal from "../common/Modal"; // adjust path as needed

const Pomodoro = () => {
  const [workTime, setWorkTime] = useState(() => {
    return Number(localStorage.getItem("workTime")) || 25 * 60;
  });
  const [breakTime, setBreakTime] = useState(() => {
    return Number(localStorage.getItem("breakTime")) || 5 * 60;
  });
  const [timeLeft, setTimeLeft] = useState(() => {
    return Number(localStorage.getItem("timeLeft")) || 25 * 60;
  });
  const [isRunning, setIsRunning] = useState(false);
  const [isWork, setIsWork] = useState(() => {
    return localStorage.getItem("isWork") === "false" ? false : true;
  });
  const [showSettings, setShowSettings] = useState(false);

  const intervalRef = useRef(null);
  const alarmRef = useRef(null);
  const alarmPlayedRef = useRef(false); // separate flag for alarm
  const unlockedRef = useRef(false);

  // Format MM:SS
  const formatTime = (seconds) => {
    const m = String(Math.floor(seconds / 60)).padStart(2, "0");
    const s = String(seconds % 60).padStart(2, "0");
    return `${m}:${s}`;
  };

  // Init alarm
  useEffect(() => {
    alarmRef.current = new Audio("/alarm.mp3");
    alarmRef.current.load();
  }, []);

  const playAlarm = () => {
    if (alarmRef.current) {
      alarmRef.current.currentTime = 0;
      alarmRef.current
        .play()
        .catch((err) => console.log("Alarm blocked:", err));
    }
  };

  // Persist values
  useEffect(() => {
    localStorage.setItem("workTime", workTime);
    localStorage.setItem("breakTime", breakTime);
    localStorage.setItem("timeLeft", timeLeft);
    localStorage.setItem("isWork", isWork);
  }, [workTime, breakTime, timeLeft, isWork]);

  // Timer logic (timestamp-based)
  useEffect(() => {
    if (isRunning) {
      const startTime = Date.now();
      const targetTime = startTime + timeLeft * 1000;

      intervalRef.current = setInterval(() => {
        const now = Date.now();
        const diff = Math.max(0, Math.round((targetTime - now) / 1000));
        setTimeLeft(diff);

        // 🔔 Alarm 10 seconds before end
        if (diff === 10 && !alarmPlayedRef.current) {
          playAlarm();
          alarmPlayedRef.current = true;
        }

        // ⏱️ Switch mode at 0
        if (diff <= 0) {
          clearInterval(intervalRef.current);
          alarmPlayedRef.current = false; // reset for next round

          if (isWork) {
            setIsWork(false);
            setTimeLeft(breakTime);
          } else {
            setIsWork(true);
            setTimeLeft(workTime);
          }
        }
      }, 1000);
    }

    return () => clearInterval(intervalRef.current);
  }, [isRunning, isWork, workTime, breakTime]);

  // Handlers
  const toggleStart = () => {
    // Unlock audio on first user interaction
    if (!unlockedRef.current && alarmRef.current) {
      alarmRef.current
        .play()
        .then(() => {
          alarmRef.current.pause();
          alarmRef.current.currentTime = 0;
          unlockedRef.current = true;
        })
        .catch(() => {});
    }
    setIsRunning((prev) => !prev);
  };

  const restart = () => {
    clearInterval(intervalRef.current);
    setIsRunning(false);
    setIsWork(true);
    setTimeLeft(workTime);
  };

  const saveSettings = (e) => {
    e.preventDefault();
    const w = Number(e.target.work.value);
    const b = Number(e.target.break.value);
    setWorkTime(w * 60);
    setBreakTime(b * 60);
    setTimeLeft(w * 60);
    setIsWork(true);
    setIsRunning(false);
    setShowSettings(false);
  };

  return (
    <div
      id="pomodoro"
      className="flex-1 flex bg-inherit h-[150px] rounded-l-md seperate"
    >
      {/* Left side with buttons */}
      <div className="flex flex-col justify-evenly border-r-[1px] border-border-light dark:border-border-dark divide-y-[1px] divide-border-light dark:divide-border-dark">
        <button
          onClick={toggleStart}
          className="p-2 flex-grow transition-all duration-200"
        >
          <img
            src={isRunning ? "../pause.svg" : "../start.svg"}
            alt="start/pause"
            className="w-4 h-4 dark:invert "
          />
        </button>
        <button
          onClick={restart}
          className="p-2 flex-grow transition-all duration-200"
        >
          <img
            src="../restart.svg"
            alt="restart"
            className="w-4 h-4 dark:invert"
          />
        </button>
        <button
          onClick={() => setShowSettings(true)}
          className="p-2 flex-grow transition-all duration-200"
        >
          <img
            src="../timer.svg"
            alt="timer"
            className="w-4 h-4 dark:invert"
          />
        </button>
      </div>

      {/* Right side */}
      <div className="flex-1 flex flex-col justify-evenly items-center p-2">
        <div className="font-jaro text-md text-black dark:text-white text-center drop-shadow-md tracking-wider">
          {isWork ? "work!" : "break!"}
        </div>
        <div className="font-jaro text-md text-black dark:text-white text-center">
          {formatTime(timeLeft)}
        </div>
      </div>

      {/* Settings Modal */}
      <Modal
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
        title="Timer Settings"
      >
        <form onSubmit={saveSettings} className="flex flex-col gap-4">
          <div className="space-y-4">
            <div className="flex flex-col gap-2">
              <label className="text-black dark:text-white font-medium">
                Work Duration (minutes)
              </label>
              <input
                type="number"
                name="work"
                defaultValue={workTime / 60}
                min="1"
                max="120"
                className="w-full px-4 py-2 rounded-lg border-[1px] border-border-light dark:border-border-dark
                          bg-black/5 dark:bg-white/5 
                          text-black dark:text-white
                          focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white/50
                          transition-all duration-200
                          appearance-none [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none [-moz-appearance:textfield]"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-black dark:text-white font-medium">
                Break Duration (minutes)
              </label>
              <input
                type="number"
                name="break"
                defaultValue={breakTime / 60}
                min="1"
                max="30"
                className="w-full px-4 py-2 rounded-lg border-[1px] border-border-light dark:border-border-dark
                          bg-black/5 dark:bg-white/5 
                          text-black dark:text-white
                          focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white/50
                          transition-all duration-200
                          appearance-none [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none [-moz-appearance:textfield]"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 mt-4">
            <button
              type="button"
              onClick={() => setShowSettings(false)}
              className="px-5 py-2 rounded-lg bg-navbar-light/30 dark:bg-navbar-dark/80  border-[1px] border-border-light dark:border-border-dark
                        text-black dark:text-white hover:bg-navbar-light/50 dark:hover:bg-navbar-dark
                        transition-all duration-200 font-medium 
                        hover:border-black dark:hover:border-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-lg bg-black dark:bg-white text-white dark:text-black
                        font-bold shadow-md hover:shadow-lg
                        transition-all duration-200 hover:scale-[1.02]
                        hover:bg-black/70 dark:hover:bg-white/90"
            >
              Save Changes
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Pomodoro;

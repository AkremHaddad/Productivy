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
  const alarmPlayedRef = useRef(false);

  // Format MM:SS
  const formatTime = (seconds) => {
    const m = String(Math.floor(seconds / 60)).padStart(2, "0");
    const s = String(seconds % 60).padStart(2, "0");
    return `${m}:${s}`;
  };

  // Alarm
  const playAlarm = () => {
    const audio = new Audio("/alarm.mp3"); // place alarm.mp3 in public/
    audio.play();
  };

  // Persist values whenever they change
  useEffect(() => {
    localStorage.setItem("workTime", workTime);
    localStorage.setItem("breakTime", breakTime);
    localStorage.setItem("timeLeft", timeLeft);
    localStorage.setItem("isWork", isWork);
  }, [workTime, breakTime, timeLeft, isWork]);

  // Timer logic
  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev > 0) {
            if (prev === 11 && !alarmPlayedRef.current) {
              playAlarm();
              alarmPlayedRef.current = true;
            }
            return prev - 1;
          }

          // Switch mode when timer hits 0
          clearInterval(intervalRef.current);
          alarmPlayedRef.current = false;
          if (isWork) {
            setIsWork(false);
            setTimeLeft(breakTime);
          } else {
            setIsWork(true);
            setTimeLeft(workTime);
          }
          return prev;
        });
      }, 1000);
    }
    return () => clearInterval(intervalRef.current);
  }, [isRunning, isWork, workTime, breakTime]);

  useEffect(() => {
    alarmPlayedRef.current = false;
  }, [timeLeft, isWork]);

  // Handlers
  const toggleStart = () => setIsRunning((prev) => !prev);

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
      {/* Left side with buttons from top to bottom */}
      <div className="flex flex-col justify-evenly border-r-2 border-gray-400 dark:border-gray-700 divide-y divide-gray-400 dark:divide-gray-700">
        <button onClick={toggleStart} className="p-2 flex-grow transition-all duration-200">
          <img
            src={isRunning ? "../pause.svg" : "../start.svg"}
            alt="start/pause"
            className="w-4 h-4 invert brightness-0"
          />
        </button>
        <button onClick={restart} className="p-2 flex-grow transition-all duration-200">
          <img src="../restart.svg" alt="restart" className="w-4 h-4 invert brightness-0" />
        </button>
        <button onClick={() => setShowSettings(true)} className="p-2 flex-grow transition-all duration-200">
          <img src="../timer.svg" alt="timer" className="w-4 h-4 invert brightness-0" />
        </button>
      </div>

      {/* Right side with Pomodoro text at top and timer at bottom */}
      <div className="flex-1 flex flex-col justify-evenly items-center p-2">    
        <div className="font-jaro text-md text-white dark:text-white text-center drop-shadow-md tracking-wider">
          {isWork ? "work!" : "break!"}
        </div>
        <div className="font-jaro text-md text-[#C3C3C3] dark:text-[#A6A6A6] text-center">
          {formatTime(timeLeft)}
        </div>
      </div>

      {/* Settings Modal */}
      <Modal isOpen={showSettings} onClose={() => setShowSettings(false)} title="Timer Settings">
        <form onSubmit={saveSettings} className="flex flex-col gap-4">
          <div className="space-y-4">
            <div className="flex flex-col gap-2">
              <label className="text-text-light dark:text-text-dark font-medium">
                Work Duration (minutes)
              </label>
              <input
                type="number"
                name="work"
                defaultValue={workTime / 60}
                min="1"
                max="120"
                className="w-full px-4 py-2 rounded-lg border-2 border-navbar-light/30 dark:border-accent/30 
                          bg-white/80 dark:bg-navbar-dark/80 
                          text-text-light dark:text-text-dark
                          focus:outline-none focus:ring-2 focus:ring-secondary-light/50 dark:focus:ring-accent/50
                          transition-all duration-200
                          appearance-none [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none [-moz-appearance:textfield]"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-text-light dark:text-text-dark font-medium">
                Break Duration (minutes)
              </label>
              <input
                type="number"
                name="break"
                defaultValue={breakTime / 60}
                min="1"
                max="30"
                className="w-full px-4 py-2 rounded-lg border-2 border-navbar-light/30 dark:border-accent/30 
                          bg-white/80 dark:bg-navbar-dark/80 
                          text-text-light dark:text-text-dark
                          focus:outline-none focus:ring-2 focus:ring-secondary-light/50 dark:focus:ring-accent/50
                          transition-all duration-200
                          appearance-none [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none [-moz-appearance:textfield]"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 mt-4">
            <button
              type="button"
              onClick={() => setShowSettings(false)}
              className="px-5 py-2 rounded-lg bg-navbar-light/30 dark:bg-navbar-dark/80 
                        text-text-light dark:text-text-dark hover:bg-navbar-light/50 dark:hover:bg-navbar-dark
                        transition-all duration-200 font-medium border border-transparent 
                        hover:border-secondary-light/30 dark:hover:border-accent/30"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-lg bg-secondary-light dark:bg-accent text-white dark:text-black
                        font-bold shadow-md hover:shadow-lg
                        transition-all duration-200 hover:scale-[1.02]
                        hover:bg-secondary-light/90 dark:hover:bg-accent/90"
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
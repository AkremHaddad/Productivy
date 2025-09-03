import React, { useState, useEffect, useRef } from "react";

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
              playAlarm(); // play once at 10s left
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

  // Reset alarm flag when timer resets
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
      className="flex-1 bg-secondary-light dark:bg-secondary-dark h-[150px] rounded-md flex flex-col justify-between p-3"
    >
      {/* Top text now shows Work/Break */}
      <div className="font-jaro text-xl text-white text-center">
        {isWork ? "work" : "break"}
      </div>

      <div className="font-jaro text-2xl text-accent text-center drop-shadow-md tracking-wider">
        {formatTime(timeLeft)}
      </div>

      <div className="flex gap-1 justify-center">
        <button 
          onClick={toggleStart}
          className="p-1.5 rounded-full hover:bg-white/30  dark:hover:bg-accent/30 transition-all duration-200"
        >
          <img
            src={isRunning ? "../pause.svg" : "../start.svg"}
            alt="start/pause"
            className="w-6 h-6 filter invert dark:invert-0"
          />
        </button>
        <button 
          onClick={restart}
          className="p-1.5 rounded-full hover:bg-white/30  dark:hover:bg-accent/30 transition-all duration-200"
        >
          <img 
            src="../restart.svg" 
            alt="restart" 
            className="w-6 h-6 filter invert dark:invert-0"
          />
        </button>
        <button 
          onClick={() => setShowSettings(true)}
          className="p-1.5 rounded-full  hover:bg-white/30  dark:hover:bg-accent/30 transition-all duration-200"
        >
          <img 
            src="../timer.svg" 
            alt="timer" 
            className="w-6 h-6 filter invert dark:invert-0"
          />
        </button>
      </div>

      {/* Settings Popup */}
      {showSettings && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 backdrop-blur-sm ">
          <form
            onSubmit={saveSettings}
            className="bg-background-light dark:bg-background-dark 
                      border-2 border-secondary-light/30 dark:border-accent/40
                      p-6 rounded-2xl shadow-2xl flex flex-col gap-4 w-full max-w-md
                      backdrop-blur-md bg-opacity-95 dark:bg-opacity-95"
          >
            <h2 className="text-2xl font-jaro font-bold text-center text-secondary-light dark:text-accent">
              Timer Settings
            </h2>
            
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
        </div>
      )}
    </div>
  );
};

export default Pomodoro;
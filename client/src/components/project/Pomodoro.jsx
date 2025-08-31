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

      <div className="font-jaro text-md text-accent text-center">
        {formatTime(timeLeft)}
      </div>

      <div className="flex gap-2 justify-center">
        <button onClick={toggleStart}>
          <img
            src={isRunning ? "../pause.svg" : "../start.svg"}
            alt="start/pause"
          />
        </button>
        <button onClick={restart}>
          <img src="../restart.svg" alt="restart" />
        </button>
        <button onClick={() => setShowSettings(true)}>
          <img src="../timer.svg" alt="timer" />
        </button>
      </div>

      {/* Settings Popup */}
      {showSettings && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 backdrop-blur-sm">
          <form
            onSubmit={saveSettings}
            className="bg-background-light dark:bg-background-dark 
                      border-2 border-secondary-dark dark:border-accent
                      p-6 rounded-xl shadow-2xl flex flex-col gap-4 w-full max-w-md"
          >
            <h2 className="text-2xl font-jaro font-bold text-center text-secondary-dark dark:text-accent">
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
                  className="w-full px-4 py-2 rounded-lg border-2 border-navbar-light dark:border-navbar-dark 
                            bg-ui-light dark:bg-navbar-dark 
                            text-text-light dark:text-text-dark
                            focus:outline-none focus:ring-2 focus:ring-accent
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
                  className="w-full px-4 py-2 rounded-lg border-2 border-navbar-light dark:border-navbar-dark 
                            bg-ui-light dark:bg-navbar-dark 
                            text-text-light dark:text-text-dark
                            focus:outline-none focus:ring-2 focus:ring-accent
                            appearance-none [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none [-moz-appearance:textfield]"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-4">
              <button
                type="button"
                onClick={() => setShowSettings(false)}
                className="px-5 py-2 rounded-lg bg-navbar-light dark:bg-navbar-dark 
                          text-text-dark hover:bg-opacity-80 transition-all
                          font-medium border border-transparent hover:border-accent"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-lg bg-secondary-light dark:bg-accent text-primary-dark dark:text-black
                          font-bold shadow-md hover:shadow-lg
                          transition-all duration-200
                          hover:bg-secondary-light dark:hover:bg-secondary-dark/80
                          transform hover:scale-[1.02]"
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

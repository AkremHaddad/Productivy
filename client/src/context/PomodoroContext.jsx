import React, { useState, useEffect, useRef } from "react";
import API from "../api/API";
import { PomodoroContext } from "./pomodoroContextInstance";

// Pomodoro's timer state used to live entirely inside Pomodoro.jsx. Now that
// it renders as a permanent pill in the navbar (see Navbar.jsx's
// PomodoroPill), and every page mounts its own Navbar independently, that
// state needs a single owner that survives page navigation - otherwise a
// running timer would silently pause every time the route changes, since
// isRunning was plain component state with no persistence. Ported verbatim
// from the old Pomodoro.jsx, same logic, just relocated.
export const PomodoroProvider = ({ children }) => {
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

  // Auto-infer activity status: a running work session means "working",
  // without requiring a manual status switch (per the design review -
  // switching status manually was pure friction nobody used).
  useEffect(() => {
    if (!isRunning || !isWork) return;
    API.post("/api/activity/set", { activity: "working" }, { withCredentials: true }).catch(() => {});
  }, [isRunning, isWork]);

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
    alarmPlayedRef.current = false;
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
    alarmPlayedRef.current = false;
  };

  return (
    <PomodoroContext.Provider
      value={{
        workTime,
        breakTime,
        timeLeft,
        isRunning,
        isWork,
        showSettings,
        setShowSettings,
        toggleStart,
        restart,
        saveSettings,
      }}
    >
      {children}
    </PomodoroContext.Provider>
  );
};

import React from "react";
import Modal from "../common/Modal";
import { usePomodoro } from "../../api/usePomodoro";

// Format MM:SS
const formatTime = (seconds) => {
  const m = String(Math.floor(seconds / 60)).padStart(2, "0");
  const s = String(seconds % 60).padStart(2, "0");
  return `${m}:${s}`;
};

// Pure visual now - all state lives in PomodoroContext (see that file for
// why: this renders inside the navbar's popover, which must survive page
// navigation without resetting a running timer).
const Pomodoro = () => {
  const {
    workTime, breakTime, timeLeft, isRunning, isWork,
    showSettings, setShowSettings, toggleStart, restart, saveSettings,
  } = usePomodoro();

  // Ring depletes as the session runs down - the standard focus-timer
  // convention (starts full, empties toward the end), same stroke-dasharray
  // technique as Sprints.jsx's CompletionDial / the dashboard's goal ring.
  const duration = isWork ? workTime : breakTime;
  const percent = duration > 0 ? timeLeft / duration : 0;
  const RING_RADIUS = 56;
  const RING_CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS;

  return (
    <div
      id="pomodoro"
      className="bg-ui-light dark:bg-ui-dark rounded-2xl border border-border-light dark:border-border-dark p-5 flex flex-col items-center"
    >
      <div className="font-mono text-[11px] font-semibold tracking-widest uppercase text-secondary-light dark:text-secondary-dark mb-3">
        Pomodoro
      </div>

      <div className="relative w-[132px] h-[132px] mb-3">
        <svg width="132" height="132" viewBox="0 0 132 132">
          <circle cx="66" cy="66" r={RING_RADIUS} fill="none" className="stroke-border-light dark:stroke-border-dark" strokeWidth="10" />
          <circle
            cx="66" cy="66" r={RING_RADIUS} fill="none" className="stroke-accent" strokeWidth="10"
            strokeLinecap="round"
            strokeDasharray={`${percent * RING_CIRCUMFERENCE} ${RING_CIRCUMFERENCE}`}
            transform="rotate(-90 66 66)"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <div className="font-mono font-bold text-xl text-text-light dark:text-text-dark">{formatTime(timeLeft)}</div>
          <div className="text-[10px] font-semibold uppercase tracking-wide text-secondary-light dark:text-secondary-dark">
            {isWork ? "Focus" : "Break"}
          </div>
        </div>
      </div>

      <div className="flex gap-2">
        <button
          onClick={toggleStart}
          title={isRunning ? "Pause" : "Start"}
          className="w-9 h-9 rounded-lg bg-accent flex items-center justify-center hover:opacity-90 transition"
        >
          <img src={isRunning ? "../pause.svg" : "../start.svg"} alt="start/pause" className="w-4 h-4" />
        </button>
        <button
          onClick={restart}
          title="Restart"
          className="w-9 h-9 rounded-lg bg-header-light dark:bg-header-dark border border-border-light dark:border-border-dark flex items-center justify-center hover:opacity-80 transition"
        >
          <img src="../restart.svg" alt="restart" className="w-4 h-4 dark:invert" />
        </button>
        <button
          onClick={() => setShowSettings(true)}
          title="Timer settings"
          className="w-9 h-9 rounded-lg bg-header-light dark:bg-header-dark border border-border-light dark:border-border-dark flex items-center justify-center hover:opacity-80 transition"
        >
          <img src="../timer.svg" alt="timer" className="w-4 h-4 dark:invert" />
        </button>
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

import React, { useState, useRef, useEffect } from 'react';
import { NavLink } from 'react-router';
import { ViewColumnsIcon, Squares2X2Icon } from "@heroicons/react/24/outline";
import ThemeToggle from './ThemeToggle';
import Pomodoro from '../project/Pomodoro';
import Time from '../project/Time';
import { useActivity } from '../../api/useActivity';
import { usePomodoro } from '../../api/usePomodoro';
import { getGoal } from '../../api/activity';
import { formatTime } from '../../utils/formatTime';

const pillLinkClass = ({ isActive }) =>
  `flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-semibold whitespace-nowrap transition-colors flex-none ${
    isActive
      ? "border-accent bg-header-light dark:bg-header-dark text-text-light dark:text-text-dark"
      : "border-border-light dark:border-border-dark bg-header-light dark:bg-header-dark text-secondary-light dark:text-secondary-dark hover:text-text-light dark:hover:text-text-dark"
  }`;

const Divider = () => <div className="w-px h-5 bg-border-light dark:bg-border-dark flex-none" />;

// Shared outside-click-to-close behavior, same pattern as Board.jsx's
// BoardActionsDropdown - reused here for the Pomodoro/Time nav popovers.
const usePopover = () => {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);
  return { open, setOpen, ref };
};

const StatusPill = () => {
  const { currentActivity, loading, toggleActivity } = useActivity();
  const isWorking = currentActivity === "working";

  return (
    <button
      onClick={() => !loading && toggleActivity()}
      title="Click to toggle working / off"
      className="flex-none flex items-center gap-2 px-3 py-1.5 rounded-full border border-border-light dark:border-border-dark bg-header-light dark:bg-header-dark"
    >
      <span className={`w-2 h-2 rounded-full flex-none ${isWorking ? "bg-[#8B7CF6] animate-pulse" : "bg-secondary-dark"}`} />
      <span className="text-xs font-semibold text-text-light dark:text-text-dark capitalize whitespace-nowrap">
        {loading ? "Saving..." : currentActivity || "No activity"}
      </span>
    </button>
  );
};

const RING_R = 7.2;
const RING_C = 2 * Math.PI * RING_R;

const PomodoroPill = () => {
  const { timeLeft, workTime, breakTime, isWork } = usePomodoro();
  const { open, setOpen, ref } = usePopover();
  const duration = isWork ? workTime : breakTime;
  const percent = duration > 0 ? timeLeft / duration : 0;
  const mm = String(Math.floor(timeLeft / 60)).padStart(2, "0");
  const ss = String(timeLeft % 60).padStart(2, "0");

  return (
    <div className="relative flex-none" ref={ref}>
      <button
        onClick={() => setOpen((o) => !o)}
        title="Pomodoro timer"
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-border-light dark:border-border-dark bg-header-light dark:bg-header-dark"
      >
        <svg width="16" height="16" viewBox="0 0 18 18">
          <circle cx="9" cy="9" r={RING_R} fill="none" className="stroke-border-light dark:stroke-border-dark" strokeWidth="2.6" />
          <circle
            cx="9" cy="9" r={RING_R} fill="none" className="stroke-accent" strokeWidth="2.6" strokeLinecap="round"
            strokeDasharray={`${percent * RING_C} ${RING_C}`} transform="rotate(-90 9 9)"
          />
        </svg>
        <span className="font-mono text-xs font-bold text-text-light dark:text-text-dark">{mm}:{ss}</span>
      </button>
      {open && (
        <div className="absolute right-0 top-full mt-2 z-50">
          <Pomodoro />
        </div>
      )}
    </div>
  );
};

const TimePill = () => {
  const { minutesWorkedToday } = useActivity();
  const { open, setOpen, ref } = usePopover();
  const [dailyGoalMinutes, setDailyGoalMinutes] = useState(360);

  useEffect(() => {
    getGoal().then((g) => setDailyGoalMinutes(g.dailyGoalMinutes ?? 360)).catch(() => {});
  }, []);

  const percent = dailyGoalMinutes > 0 ? Math.min(minutesWorkedToday / dailyGoalMinutes, 1) : 0;

  return (
    <div className="relative flex-none" ref={ref}>
      <button
        onClick={() => setOpen((o) => !o)}
        title="Time worked today"
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-border-light dark:border-border-dark bg-header-light dark:bg-header-dark"
      >
        <svg width="16" height="16" viewBox="0 0 18 18">
          <circle cx="9" cy="9" r={RING_R} fill="none" className="stroke-border-light dark:stroke-border-dark" strokeWidth="2.6" />
          <circle
            cx="9" cy="9" r={RING_R} fill="none" className="stroke-[#5B8DEF]" strokeWidth="2.6" strokeLinecap="round"
            strokeDasharray={`${percent * RING_C} ${RING_C}`} transform="rotate(-90 9 9)"
          />
        </svg>
        <span className="font-mono text-xs font-bold text-text-light dark:text-text-dark">{formatTime(minutesWorkedToday)}</span>
      </button>
      {open && (
        <div className="absolute right-0 top-full mt-2 z-50 w-[260px]">
          <Time />
        </div>
      )}
    </div>
  );
};

// One consistent row of pills, everything grouped on the right of the logo.
// Mobile drops to two rows (logo+theme, then the pill row scrolling
// horizontally) rather than trying to fit everything in one line - with
// Pomodoro/Time pills added on top of nav links + status, a single row
// simply doesn't fit a phone width.
const PillGroup = ({ authenticated }) => (
  <>
    <NavLink to="/projects" className={pillLinkClass}>
      <ViewColumnsIcon className="w-3.5 h-3.5" />
      Projects
    </NavLink>
    <NavLink to="/account" className={pillLinkClass}>
      <Squares2X2Icon className="w-3.5 h-3.5" />
      Dashboard
    </NavLink>
    {authenticated && (
      <>
        <Divider />
        <StatusPill />
        <PomodoroPill />
        <TimePill />
      </>
    )}
  </>
);

function Navbar() {
  const { authenticated } = useActivity();

  return (
    <nav className="bg-ui-light dark:bg-ui-dark w-full border-b border-border-light dark:border-border-dark select-none">
      <div className="flex items-center justify-between px-3 sm:px-4 h-14 gap-3">
        <a href="/" className="flex items-center gap-2 flex-none min-w-0">
          <img src="/logo.svg" alt="Productivy Logo" className="h-9 rounded-sm flex-none" />
          <span className="hidden sm:inline text-text-light dark:text-text-dark text-xl font-bold whitespace-nowrap">Productivy</span>
        </a>

        {/* Desktop: everything in one row */}
        <div className="hidden sm:flex items-center gap-2 min-w-0">
          <PillGroup authenticated={authenticated} />
          <Divider />
          <ThemeToggle />
        </div>

        {/* Mobile: just the theme toggle up here, pills move to row 2 below */}
        <div className="sm:hidden">
          <ThemeToggle />
        </div>
      </div>

      <div className="sm:hidden flex items-center gap-2 px-3 pb-3 overflow-x-auto">
        <PillGroup authenticated={authenticated} />
      </div>
    </nav>
  );
}

export default Navbar;

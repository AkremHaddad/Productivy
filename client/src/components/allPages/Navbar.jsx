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
      ? "border-accent-light dark:border-accent bg-header-light dark:bg-header-dark text-text-light dark:text-text-dark"
      : "border-border-light dark:border-border-dark bg-header-light dark:bg-header-dark text-secondary-light dark:text-secondary-dark hover:text-text-light dark:hover:text-text-dark"
  }`;

const iconLinkClass = ({ isActive }) =>
  `w-8 h-8 rounded-full border flex items-center justify-center flex-none transition-colors ${
    isActive
      ? "border-accent-light dark:border-accent bg-header-light dark:bg-header-dark text-text-light dark:text-text-dark"
      : "border-border-light dark:border-border-dark bg-header-light dark:bg-header-dark text-secondary-light dark:text-secondary-dark"
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

// Mobile popovers render as a bottom sheet (fixed to the viewport bottom)
// instead of the desktop dropdown anchored under the pill - matches the
// updated mock ("bottom sheet on tap"). Backdrop tap also closes it.
const BottomSheet = ({ onClose, children }) => (
  <>
    <div className="fixed inset-0 z-40 bg-black/30" onClick={onClose} />
    <div className="fixed inset-x-0 bottom-0 z-50 rounded-t-2xl bg-ui-light dark:bg-ui-dark border-t border-border-light dark:border-border-dark p-4 pb-6">
      <div className="w-10 h-1 rounded-full bg-border-light dark:bg-border-dark mx-auto mb-4" />
      {children}
    </div>
  </>
);

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
            cx="9" cy="9" r={RING_R} fill="none" className="stroke-accent-light dark:stroke-accent" strokeWidth="2.6" strokeLinecap="round"
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

// Mobile: Pomodoro + status merged into one icon (a small pulsing badge in
// the corner stands in for the old standalone "Working" pill - no separate
// status tap-target on mobile anymore). Tapping opens a bottom sheet with
// the full Pomodoro card plus a status toggle, since that's now the only
// way to reach status on a phone.
const MobilePomodoroIcon = () => {
  const { timeLeft, workTime, breakTime, isWork } = usePomodoro();
  const { currentActivity, loading, toggleActivity } = useActivity();
  const { open, setOpen, ref } = usePopover();
  const duration = isWork ? workTime : breakTime;
  const percent = duration > 0 ? timeLeft / duration : 0;
  const isWorking = currentActivity === "working";

  return (
    <div className="relative flex-none" ref={ref}>
      <button
        onClick={() => setOpen((o) => !o)}
        title="Pomodoro timer & status"
        className="relative w-8 h-8 rounded-full border border-border-light dark:border-border-dark bg-header-light dark:bg-header-dark flex items-center justify-center"
      >
        <svg width="16" height="16" viewBox="0 0 18 18">
          <circle cx="9" cy="9" r={RING_R} fill="none" className="stroke-border-light dark:stroke-border-dark" strokeWidth="2.6" />
          <circle
            cx="9" cy="9" r={RING_R} fill="none" className="stroke-accent-light dark:stroke-accent" strokeWidth="2.6" strokeLinecap="round"
            strokeDasharray={`${percent * RING_C} ${RING_C}`} transform="rotate(-90 9 9)"
          />
        </svg>
        {isWorking && (
          <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-[#8B7CF6] border border-ui-light dark:border-ui-dark animate-pulse" />
        )}
      </button>
      {open && (
        <BottomSheet onClose={() => setOpen(false)}>
          <button
            onClick={() => !loading && toggleActivity()}
            className="w-full flex items-center justify-center gap-2 mb-4 px-3 py-2 rounded-full border border-border-light dark:border-border-dark bg-header-light dark:bg-header-dark"
          >
            <span className={`w-2 h-2 rounded-full flex-none ${isWorking ? "bg-[#8B7CF6] animate-pulse" : "bg-secondary-dark"}`} />
            <span className="text-xs font-semibold text-text-light dark:text-text-dark capitalize">
              {loading ? "Saving..." : currentActivity || "No activity"}
            </span>
          </button>
          <Pomodoro />
        </BottomSheet>
      )}
    </div>
  );
};

// Mobile secondary bar: "Working · Xm today" - replaces the standalone
// Time-worked icon, tapping it opens the same Time card as a bottom sheet.
const MobileStatusBar = () => {
  const { currentActivity, minutesWorkedToday } = useActivity();
  const { open, setOpen, ref } = usePopover();

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center gap-2 px-4 py-2.5 bg-header-light dark:bg-header-dark border-t border-border-light dark:border-border-dark"
      >
        <span className="w-1.5 h-1.5 rounded-full flex-none bg-[#5B8DEF]" />
        <span className="text-xs font-semibold text-secondary-light dark:text-secondary-dark capitalize">
          {currentActivity || "off"} · {formatTime(minutesWorkedToday)} today
        </span>
      </button>
      {open && (
        <BottomSheet onClose={() => setOpen(false)}>
          <Time />
        </BottomSheet>
      )}
    </div>
  );
};

// Desktop: one consistent row of pills, everything grouped on the right of
// the logo.
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

        {/* Mobile: icon-only pills, no scrolling needed */}
        <div className="sm:hidden flex items-center gap-1.5">
          <NavLink to="/projects" className={iconLinkClass} title="Projects">
            <ViewColumnsIcon className="w-4 h-4" />
          </NavLink>
          <NavLink to="/account" className={iconLinkClass} title="Dashboard">
            <Squares2X2Icon className="w-4 h-4" />
          </NavLink>
          {authenticated && <MobilePomodoroIcon />}
          <ThemeToggle />
        </div>
      </div>

      {authenticated && (
        <div className="sm:hidden">
          <MobileStatusBar />
        </div>
      )}
    </nav>
  );
}

export default Navbar;

import React, { useState, useEffect } from "react";
import { useActivity } from "../../api/useActivity";
import { formatTime } from "../../utils/formatTime";
import { getGoal, getStreak } from "../../api/activity";

const RING_RADIUS = 27;
const RING_CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS;

const Time = () => {
  const { minutesWorkedToday, currentActivity } = useActivity();
  const [dailyGoalMinutes, setDailyGoalMinutes] = useState(360);
  const [streak, setStreak] = useState(0);

  // Same goal/streak the dashboard already shows (ProductivityDashboard.jsx) -
  // fetched here too since this card now surfaces them per-project instead
  // of only on the account dashboard.
  useEffect(() => {
    getGoal().then((g) => setDailyGoalMinutes(g.dailyGoalMinutes ?? 360)).catch(() => {});
    getStreak().then((s) => setStreak(s.streak ?? 0)).catch(() => {});
  }, []);

  const percent = dailyGoalMinutes > 0 ? Math.min(minutesWorkedToday / dailyGoalMinutes, 1) : 0;
  const isLive = currentActivity === "working";

  return (
    <div className="bg-ui-light dark:bg-ui-dark rounded-2xl border border-border-light dark:border-border-dark p-5">
      <div className="flex items-center justify-between mb-3">
        <div className="font-mono text-[11px] font-semibold tracking-widest uppercase text-secondary-light dark:text-secondary-dark">
          Time worked today
        </div>
        {isLive && (
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#8B7CF6] animate-pulse" />
            <span className="text-[10px] font-semibold text-secondary-light dark:text-secondary-dark">Live</span>
          </div>
        )}
      </div>
      <div className="flex items-center gap-4">
        <svg width="64" height="64" viewBox="0 0 64 64" className="flex-none">
          <circle cx="32" cy="32" r={RING_RADIUS} fill="none" className="stroke-border-light dark:stroke-border-dark" strokeWidth="7" />
          <circle
            cx="32" cy="32" r={RING_RADIUS} fill="none" className="stroke-accent-light dark:stroke-accent" strokeWidth="7"
            strokeLinecap="round"
            strokeDasharray={`${percent * RING_CIRCUMFERENCE} ${RING_CIRCUMFERENCE}`}
            transform="rotate(-90 32 32)"
          />
        </svg>
        <div>
          <div className="font-mono font-bold text-xl text-text-light dark:text-text-dark">{formatTime(minutesWorkedToday)}</div>
          <div className="text-xs text-secondary-light dark:text-secondary-dark">
            of {formatTime(dailyGoalMinutes)} goal · {streak}-day streak
          </div>
        </div>
      </div>
    </div>
  );
};

export default Time;

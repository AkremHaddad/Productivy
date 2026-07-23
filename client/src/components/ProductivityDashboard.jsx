// src/components/ProductivityDashboard.jsx
import React, { useEffect, useMemo, useState } from "react";
import { getProjects } from "../api/project";
import API from "../api/API";
import {
  getStreak,
  getHeatmap,
  getGoal,
  setGoal as setGoalApi,
  getTotalFocusMinutes,
  getEvents,
  getTodayEventCounts,
} from "../api/activity";
import { formatTime } from "../utils/formatTime";

const EVENT_DOT = {
  task_completed: "bg-accent-light dark:bg-accent",
  card_completed: "bg-accent-light dark:bg-accent",
  card_moved: "bg-[#5B8DEF]",
  sprint_started: "bg-amber",
  sprint_completed: "bg-accent-light dark:bg-accent",
  session_ended: "bg-[#8B7CF6]",
};

const RING_RADIUS = 70;
const RING_CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS;

const ProductivityDashboard = () => {
  const [projects, setProjects] = useState([]);
  const [todayMinutes, setTodayMinutes] = useState(0);
  const [dailyGoalMinutes, setDailyGoalMinutes] = useState(360);
  const [editingGoal, setEditingGoal] = useState(false);
  const [goalInput, setGoalInput] = useState("6");
  const [streak, setStreak] = useState(0);
  const [heatmap, setHeatmap] = useState([]);
  const [totalMinutes, setTotalMinutes] = useState(0);
  const [events, setEvents] = useState([]);
  const [todayCounts, setTodayCounts] = useState({ sprint_started: 0, sprint_completed: 0, task_completed: 0 });
  const [isLive, setIsLive] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;

    const fetchAll = async () => {
      setLoading(true);
      setError("");
      try {
        const projectsData = await getProjects();
        if (!mounted) return;
        setProjects(Array.isArray(projectsData) ? projectsData : []);
      } catch (err) {
        console.error("Error loading projects:", err);
        if (!mounted) return;
        setError("Failed to load dashboard data.");
      }

      const safe = (promise, fallback) => promise.catch((err) => {
        console.warn("Dashboard partial load failure:", err?.response?.status || err.message);
        return fallback;
      });

      const [today, goal, streakRes, heatmapRes, totalRes, eventsRes, currentRes, todayCountsRes] = await Promise.all([
        safe(API.get("/api/activity/today", { withCredentials: true }), { data: { minutes: 0 } }),
        safe(getGoal(), { dailyGoalMinutes: 360 }),
        safe(getStreak(), { streak: 0 }),
        safe(getHeatmap(7), []),
        safe(getTotalFocusMinutes(), { totalMinutes: 0 }),
        safe(getEvents(6), []),
        safe(API.get("/api/activity/current", { withCredentials: true }), { data: { activity: "working", isOnline: false } }),
        safe(getTodayEventCounts(), { sprint_started: 0, sprint_completed: 0, task_completed: 0 }),
      ]);

      if (!mounted) return;
      setTodayMinutes(today.data?.minutes ?? today.minutes ?? 0);
      setDailyGoalMinutes(goal.dailyGoalMinutes ?? 360);
      setGoalInput(String((goal.dailyGoalMinutes ?? 360) / 60));
      setStreak(streakRes.streak ?? 0);
      setHeatmap(Array.isArray(heatmapRes) ? heatmapRes : []);
      setTotalMinutes(totalRes.totalMinutes ?? 0);
      setEvents(Array.isArray(eventsRes) ? eventsRes : []);
      const current = currentRes.data ?? currentRes;
      setIsLive(Boolean(current?.isOnline) && current?.activity === "working");
      setTodayCounts(todayCountsRes);
      setLoading(false);
    };

    fetchAll();
    return () => { mounted = false; };
  }, []);

  const projectStats = useMemo(() => {
    let boards = 0, columns = 0, tasks = 0, completed = 0, sprintsShipped = 0, cardsCompleted = 0;
    projects.forEach((p) => {
      boards += p.boards?.length || 0;
      p.boards?.forEach((b) => {
        columns += b.columns?.length || 0;
        b.columns?.forEach((c) => {
          tasks += c.cards?.length || 0;
          completed += c.cards?.filter((card) => card.completed).length || 0;
          cardsCompleted += c.cards?.filter((card) => card.completed).length || 0;
        });
      });
      p.sprints?.forEach((s) => {
        if (s.tasks?.length > 0 && s.tasks.every((t) => t.completed)) sprintsShipped += 1;
      });
    });
    return { boards, columns, tasks, completed, pending: Math.max(0, tasks - completed), sprintsShipped, cardsCompleted };
  }, [projects]);

  const totalTasksAcrossSprints = useMemo(() => {
    let tasks = 0, completed = 0;
    projects.forEach((p) => p.sprints?.forEach((s) => {
      tasks += s.tasks?.length || 0;
      completed += s.tasks?.filter((t) => t.completed).length || 0;
    }));
    return { tasks, completed };
  }, [projects]);

  const projectsDone = useMemo(() => {
    const done = projects.filter((p) => {
      const allTasks = p.sprints?.flatMap((s) => s.tasks || []) || [];
      return allTasks.length > 0 && allTasks.every((t) => t.completed);
    }).length;
    return { done, total: projects.length };
  }, [projects]);

  const saveGoal = async () => {
    const hours = parseFloat(goalInput);
    if (!Number.isFinite(hours) || hours <= 0) {
      setEditingGoal(false);
      setGoalInput(String(dailyGoalMinutes / 60));
      return;
    }
    const minutes = Math.round(hours * 60);
    try {
      const res = await setGoalApi(minutes);
      setDailyGoalMinutes(res.dailyGoalMinutes);
    } catch (err) {
      console.error("Failed to save goal:", err);
    } finally {
      setEditingGoal(false);
    }
  };

  const goalPercent = dailyGoalMinutes > 0 ? Math.min(todayMinutes / dailyGoalMinutes, 1) : 0;
  const maxHeatmapMinutes = Math.max(...heatmap.map((d) => d.minutes), 1);
  const sparklinePoints = heatmap.map((d, i) => {
    const x = 4 + (i / Math.max(heatmap.length - 1, 1)) * 132;
    const y = 36 - (Math.min(d.minutes / maxHeatmapMinutes, 1) * 30);
    return `${x},${y}`;
  }).join(" ");
  const todayKey = new Date();
  todayKey.setHours(0, 0, 0, 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[229.6px] p-6 bg-ui-light dark:bg-ui-dark rounded-md text-center text-text-light dark:text-text-dark">
        Loading dashboard...
      </div>
    );
  }

  return (
    <div className="p-6 bg-ui-light dark:bg-ui-dark rounded-md space-y-5">
      {error && (
        <div className="p-3 rounded-lg bg-red-100 dark:bg-red-900/30 text-red-700">{error}</div>
      )}

      <header>
        <h2 className="text-2xl font-bold text-text-light dark:text-text-dark">Productivity Dashboard</h2>
        <p className="text-sm text-secondary-light dark:text-secondary-dark">Here's where your focus went.</p>
      </header>

      {/* Focus module */}
      <div className="bg-header-light dark:bg-header-dark border-[1px] border-border-light dark:border-border-dark rounded-2xl p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Goal ring */}
        <div className="flex flex-col items-center text-center">
          <div className="relative w-40 h-40 mb-2">
            <svg width="160" height="160" viewBox="0 0 160 160">
              <circle cx="80" cy="80" r={RING_RADIUS} fill="none" className="stroke-border-light dark:stroke-border-dark" strokeWidth="12" />
              <circle
                cx="80" cy="80" r={RING_RADIUS} fill="none" className="stroke-accent-light dark:stroke-accent" strokeWidth="12"
                strokeLinecap="round"
                strokeDasharray={`${goalPercent * RING_CIRCUMFERENCE} ${RING_CIRCUMFERENCE}`}
                transform="rotate(-90 80 80)"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <div className="font-mono font-semibold text-xl text-text-light dark:text-text-dark">{formatTime(todayMinutes)}</div>
              {editingGoal ? (
                <div className="flex items-center gap-1 mt-1">
                  <input
                    type="number"
                    min="0.25"
                    max="24"
                    step="0.25"
                    value={goalInput}
                    onChange={(e) => setGoalInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && saveGoal()}
                    onBlur={saveGoal}
                    autoFocus
                    className="w-14 text-center text-xs rounded border-[1px] border-border-light dark:border-border-dark bg-ui-light dark:bg-ui-dark text-text-light dark:text-text-dark"
                  />
                  <span className="text-[11px] text-secondary-light dark:text-secondary-dark">h goal</span>
                </div>
              ) : (
                <button
                  onClick={() => setEditingGoal(true)}
                  className="text-[11px] text-secondary-light dark:text-secondary-dark hover:text-accent-light dark:hover:text-accent transition"
                  title="Click to edit your daily goal"
                >
                  of {formatTime(dailyGoalMinutes)} goal
                </button>
              )}
            </div>
          </div>
          {isLive && (
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#8B7CF6] animate-pulse" />
              <span className="text-[11px] font-semibold text-secondary-light dark:text-secondary-dark">Live · working</span>
            </div>
          )}
        </div>

        {/* Momentum / streak */}
        <div className="md:border-l-[1px] border-border-light dark:border-border-dark md:pl-6">
          <div className="font-mono text-[11px] font-semibold tracking-widest uppercase text-secondary-light dark:text-secondary-dark mb-3">Momentum</div>
          <div className="flex items-baseline gap-2 mb-2">
            <div className="font-mono font-bold text-3xl text-accent-deep dark:text-accent">{streak}</div>
            <div className="text-sm text-secondary-light dark:text-secondary-dark">day streak</div>
          </div>
          {heatmap.length > 1 && (
            <svg width="140" height="40" viewBox="0 0 140 40">
              <polyline points={sparklinePoints} fill="none" className="stroke-accent-light dark:stroke-accent" strokeWidth="2" />
            </svg>
          )}
          <div className="text-[11px] text-secondary-light dark:text-secondary-dark mt-1">Last {heatmap.length || 7} days</div>
        </div>

        {/* 7-day trend */}
        <div className="md:border-l-[1px] border-border-light dark:border-border-dark md:pl-6">
          <div className="font-mono text-[11px] font-semibold tracking-widest uppercase text-secondary-light dark:text-secondary-dark mb-3">Time worked, last 7 days</div>
          <div className="flex items-end gap-2 h-[52px] mb-2">
            {heatmap.map((d) => {
              const isToday = new Date(d.date).getTime() === todayKey.getTime();
              const heightPct = Math.max((d.minutes / maxHeatmapMinutes) * 100, d.minutes > 0 ? 8 : 3);
              return (
                <div
                  key={d.date}
                  title={`${new Date(d.date).toLocaleDateString()}: ${formatTime(d.minutes)}`}
                  className="flex-1 flex items-end h-full"
                >
                  <div
                    className={`w-full rounded-t-sm transition-all ${isToday ? "bg-accent-light dark:bg-accent" : "bg-accent-light/60 dark:bg-accent/50"}`}
                    style={{ height: `${heightPct}%` }}
                  />
                </div>
              );
            })}
          </div>
          <div className="flex gap-2">
            {heatmap.map((d) => (
              <div key={d.date} className="flex-1 text-center text-[9px] font-medium text-secondary-light dark:text-secondary-dark">
                {new Date(d.date).toLocaleDateString(undefined, { weekday: "narrow" })}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Today */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="bg-header-light dark:bg-header-dark border-[1px] border-border-light dark:border-border-dark rounded-xl px-4 py-3">
          <div className="text-xs text-secondary-light dark:text-secondary-dark mb-1">Sprints created today</div>
          <div className="font-mono font-bold text-xl text-text-light dark:text-text-dark">{todayCounts.sprint_started}</div>
        </div>
        <div className="bg-header-light dark:bg-header-dark border-[1px] border-border-light dark:border-border-dark rounded-xl px-4 py-3">
          <div className="text-xs text-secondary-light dark:text-secondary-dark mb-1">Sprints shipped today</div>
          <div className="font-mono font-bold text-xl text-text-light dark:text-text-dark">{todayCounts.sprint_completed}</div>
        </div>
        <div className="bg-header-light dark:bg-header-dark border-[1px] border-border-light dark:border-border-dark rounded-xl px-4 py-3">
          <div className="text-xs text-secondary-light dark:text-secondary-dark mb-1">Tasks completed today</div>
          <div className="font-mono font-bold text-xl text-text-light dark:text-text-dark">{todayCounts.task_completed}</div>
        </div>
      </div>

      {/* Stat tiles */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="bg-header-light dark:bg-header-dark border-[1px] border-border-light dark:border-border-dark rounded-xl px-4 py-3">
          <div className="text-xs text-secondary-light dark:text-secondary-dark mb-1">Projects</div>
          <div className="font-mono font-bold text-xl text-text-light dark:text-text-dark">{projects.length}</div>
        </div>
        <div className="bg-header-light dark:bg-header-dark border-[1px] border-border-light dark:border-border-dark rounded-xl px-4 py-3">
          <div className="text-xs text-secondary-light dark:text-secondary-dark mb-1">Tasks</div>
          <div className="font-mono font-bold text-xl text-text-light dark:text-text-dark">
            {totalTasksAcrossSprints.tasks + projectStats.tasks}
            <span className="font-sans font-normal text-xs text-secondary-light dark:text-secondary-dark ml-1">
              · {totalTasksAcrossSprints.completed + projectStats.completed} done
            </span>
          </div>
        </div>
        <div className="bg-header-light dark:bg-header-dark border-[1px] border-border-light dark:border-border-dark rounded-xl px-4 py-3">
          <div className="text-xs text-secondary-light dark:text-secondary-dark mb-1">Boards / Columns</div>
          <div className="font-mono font-bold text-xl text-text-light dark:text-text-dark">{projectStats.boards} / {projectStats.columns}</div>
        </div>
      </div>

      {/* Recap + Milestones */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div className="bg-header-light dark:bg-header-dark border-[1px] border-border-light dark:border-border-dark rounded-2xl p-5">
          <div className="font-bold text-sm text-text-light dark:text-text-dark mb-0.5">Today's recap</div>
          <div className="text-xs text-secondary-light dark:text-secondary-dark mb-4">Auto-summarized from your boards and timer</div>
          {events.length === 0 ? (
            <div className="text-sm text-secondary-light dark:text-secondary-dark">Nothing yet today — get moving.</div>
          ) : (
            <div className="flex flex-col gap-3">
              {events.map((ev) => (
                <div key={ev._id} className="flex items-baseline gap-2.5">
                  <span className={`w-1.5 h-1.5 rounded-full flex-none ${EVENT_DOT[ev.type] || "bg-secondary-dark"}`} />
                  <span className="flex-1 text-sm font-medium text-text-light dark:text-text-dark">{ev.message}</span>
                  <span className="font-mono text-[11px] text-secondary-light dark:text-secondary-dark">
                    {new Date(ev.createdAt).toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" })}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-header-light dark:bg-header-dark border-[1px] border-border-light dark:border-border-dark rounded-2xl p-5">
          <div className="font-bold text-sm text-text-light dark:text-text-dark mb-0.5">Milestones</div>
          <div className="text-xs text-secondary-light dark:text-secondary-dark mb-4">Quiet totals, not badges to chase</div>
          <div className="flex flex-col gap-2.5">
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-accent-light dark:bg-accent" />
              <span className="text-sm font-medium text-text-light dark:text-text-dark">{formatTime(totalMinutes)} total focus</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-amber" />
              <span className="text-sm font-medium text-text-light dark:text-text-dark">{streak}-day streak</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-accent-light dark:bg-accent" />
              <span className="text-sm font-medium text-text-light dark:text-text-dark">{projectStats.sprintsShipped} sprints shipped</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-amber" />
              <span className="text-sm font-medium text-text-light dark:text-text-dark">{projectStats.cardsCompleted} cards completed</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-accent-light dark:bg-accent" />
              <span className="text-sm font-medium text-text-light dark:text-text-dark">{projectsDone.done} of {projectsDone.total} projects done</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductivityDashboard;

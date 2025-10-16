// src/components/ProductivityDashboard.jsx
import React, { useEffect, useMemo, useState } from "react";
import { getProjects } from "../api/project";
import API from "../api/API";

const ProductivityDashboard = () => {
  const [projects, setProjects] = useState([]);
  const [todayMinutes, setTodayMinutes] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Helper: tolerant extractor for various backend shapes
  const extractMinutesFromActivity = (data) => {
    if (!data) return 0;

    // common explicit fields
    if (typeof data.minutes === "number") return data.minutes;
    if (typeof data.totalMinutes === "number") return data.totalMinutes;
    if (typeof data.minutesWorked === "number") return data.minutesWorked;

    // If data has a "hours" map/object shape:
    // - Could be { working: { hours: 2 } } or { working: 120 } or hourly map
    const hours = data.hours || data.hoursMap || data.hourly;
    if (hours && typeof hours === "object") {
      // If hourly array of 24 entries with minute totals:
      if (Array.isArray(hours)) {
        return hours.reduce((acc, v) => {
          if (typeof v === "number") return acc + v;
          if (typeof v === "object" && (v.minutes || v.min)) return acc + (v.minutes || v.min);
          return acc;
        }, 0);
      }

      // If object with activity -> number or activity -> { minutes / hours }
      return Object.values(hours).reduce((acc, v) => {
        if (typeof v === "number") return acc + v;
        if (typeof v === "object") {
          if (typeof v.minutes === "number") return acc + v.minutes;
          if (typeof v.min === "number") return acc + v.min;
          // support nested hourly maps (sum all nested numbers)
          if (typeof v === "object") {
            // sum numeric leaves
            const sumNested = (obj) =>
              Object.values(obj).reduce((s, x) => {
                if (typeof x === "number") return s + x;
                if (typeof x === "object") return s + sumNested(x);
                return s;
              }, 0);
            return acc + sumNested(v);
          }
        }
        return acc;
      }, 0);
    }

    return 0;
  };

  useEffect(() => {
    let mounted = true;
    const fetchDashboard = async () => {
      setLoading(true);
      setError("");
      try {
        // fetch projects (protected route)
        const projectsData = await getProjects();
        if (!mounted) return;
        setProjects(Array.isArray(projectsData) ? projectsData : []);

        // fetch today's activity — use /api/activity/today (session-based)
        try {
          const todayRes = await API.get("/api/activity/today", { withCredentials: true });
          if (!mounted) return;
          const minutes = extractMinutesFromActivity(todayRes.data);
          setTodayMinutes(minutes);
        } catch (err) {
          // if 404 or other, fallback to 0 (don't blow up the UI)
          console.warn("Could not fetch /api/activity/today — falling back to 0 minutes", err?.response?.status);
          if (!mounted) return;
          setTodayMinutes(0);
        }
      } catch (err) {
        console.error("Error loading dashboard data:", err);
        if (!mounted) return;
        setError("Failed to load dashboard data.");
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchDashboard();
    return () => {
      mounted = false;
    };
  }, []);

  const projectStats = useMemo(() => {
    let boards = 0,
      columns = 0,
      tasks = 0,
      completed = 0;
    projects.forEach((p) => {
      boards += p.boards?.length || 0;
      p.boards?.forEach((b) => {
        columns += b.columns?.length || 0;
        b.columns?.forEach((c) => {
          tasks += c.cards?.length || 0;
          completed += c.cards?.filter((card) => card.completed).length || 0;
        });
      });
      p.sprints?.forEach((s) => {
        tasks += s.tasks?.length || 0;
        completed += s.tasks?.filter((t) => t.completed).length || 0;
      });
    });
    return { boards, columns, tasks, completed, pending: Math.max(0, tasks - completed) };
  }, [projects]);

  if (loading) {
    return (
      <div className="p-6 bg-ui-light dark:bg-ui-dark rounded-md shadow text-center">
        Loading dashboard...
      </div>
    );
  }

  return (
    <div className="p-6 bg-ui-light dark:bg-ui-dark rounded-md space-y-6">
      {error && (
        <div className="p-3 rounded bg-red-100 dark:bg-red-900/30 text-red-700">{error}</div>
      )}

      <header>
        <h2 className="text-2xl font-bold text-black dark:text-white">Productivity Dashboard</h2>
        <p className="text-sm text-gray-600 dark:text-gray-300">A quick snapshot of your progress</p>
      </header>

      <section className="grid grid-cols-1 md:grid-cols-4 gap-4 ">
        <div className="p-4 bg-white dark:bg-background-dark rounded shadow border-[1px] border-border-light dark:border-border-dark">
          <div className="text-sm text-gray-500">Minutes Today</div>
          <div className="text-2xl font-bold text-black dark:text-white">{todayMinutes}</div>
          <div className="text-xs text-gray-400 mt-1">Keep focused — small blocks add up.</div>
        </div>

        <div className="p-4 bg-white dark:bg-background-dark rounded shadow border-[1px] border-border-light dark:border-border-dark">
          <div className="text-sm text-gray-500">Projects</div>
          <div className="text-2xl font-bold text-black dark:text-white">{projects.length}</div>
          <div className="text-xs text-gray-400 mt-1">Active projects in your workspace</div>
        </div>

        <div className="p-4 bg-white dark:bg-background-dark rounded shadow border-[1px] border-border-light dark:border-border-dark">
          <div className="text-sm text-gray-500">Tasks</div>
          <div className="text-2xl font-bold text-black dark:text-white">{projectStats.tasks}</div>
          <div className="text-xs text-gray-400 mt-1">{projectStats.completed} completed · {projectStats.pending} pending</div>
        </div>

        <div className="p-4 bg-white dark:bg-background-dark rounded shadow border-[1px] border-border-light dark:border-border-dark">
          <div className="text-sm text-gray-500">Boards / Columns</div>
          <div className="text-2xl font-bold text-black dark:text-white">{projectStats.boards} / {projectStats.columns}</div>
          <div className="text-xs text-gray-400 mt-1">Organization structure</div>
        </div>
      </section>
    </div>
  );
};

export default ProductivityDashboard;

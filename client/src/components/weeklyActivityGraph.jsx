import React, { useState, useEffect } from "react";
import { activityColors, activities } from "./pages/chartsHelper";
import API from "../api/API";

const WeeklyActivityGraph = () => {
  const [selectedWeek, setSelectedWeek] = useState(0); // 0 = this week
  const [weeks, setWeeks] = useState([]); // array of week start dates
  const [weekData, setWeekData] = useState([]); // 24-hour activity averages
  const [hoveredActivity, setHoveredActivity] = useState(null);
  const [tooltipData, setTooltipData] = useState({
    visible: false,
    x: 0,
    y: 0,
    activity: "",
    hour: "",
    minutes: 0,
  });

  const width = 1000;
  const height = 100;
  const margin = { top: 20, right: 20, bottom: 40, left: 60 };

  // --- Initialize last 4 weeks (Monday start)
  useEffect(() => {
    const weeksArr = [];
    const today = new Date();
    for (let i = 3; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i * 7);
      // move to Monday
      const day = d.getDay();
      const diff = day === 0 ? -6 : 1 - day;
      d.setDate(d.getDate() + diff);
      weeksArr.push(new Date(d));
    }
    setWeeks(weeksArr);
  }, []);

  // --- Fetch weekly data for selected week
  useEffect(() => {
    if (!weeks.length) return;
    const weekStartStr = weeks[selectedWeek].toISOString().split("T")[0];

    const fetchWeekData = async () => {
      try {
        const res = await API.get(`/api/charts/weekly?date=${weekStartStr}`, { withCredentials: true });
        const raw = res.data; // WeeklySummary doc
        const hoursArr = [];

        for (let h = 0; h < 24; h++) {
          const hourData = raw.hours?.[h] || {};
          const hourActivities = [];

          for (const [act, mins] of Object.entries(hourData)) {
            if (mins > 0) hourActivities.push({ activity: act, minutes: mins });
          }

          // ensure offline is included if missing
          const totalMins = Object.values(hourData).reduce((a, b) => a + b, 0);
          if (totalMins < 60) hourActivities.push({ activity: "offline", minutes: 60 - totalMins });

          hoursArr.push(hourActivities);
        }

        setWeekData(hoursArr);
      } catch (err) {
        console.error(err);
        setWeekData([]);
      }
    };

    fetchWeekData();
  }, [selectedWeek, weeks]);

  const handleActivityHover = (activity, hour) => {
    setHoveredActivity(activity.activity);
    setTooltipData({
      visible: true,
      x: 0,
      y: 0,
      activity: activity.activity,
      hour,
      minutes: activity.minutes,
    });
  };

  const handleActivityMove = (e) => {
    setTooltipData((prev) => ({
      ...prev,
      x: e.clientX,
      y: e.clientY - 70,
    }));
  };

  const handleActivityLeave = () => {
    setHoveredActivity(null);
    setTooltipData((prev) => ({ ...prev, visible: false }));
  };

  return (
    <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md transition-colors">
      <h2 className="text-xl font-bold mb-4 text-gray-800 dark:text-white transition-colors">
        Weekly Activity Timeline
      </h2>

      {/* Week selector */}
      <div className="flex gap-2 mb-4 flex-wrap">
        {weeks.map((weekStart, idx) => {
          const startStr = weekStart.toISOString().split("T")[0];
          return (
            <button
              key={idx}
              className={`px-3 py-1 rounded-md font-medium text-sm transition-colors ${
                selectedWeek === idx
                  ? "bg-blue-600 text-white"
                  : "bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200"
              }`}
              onClick={() => setSelectedWeek(idx)}
            >
              {idx === weeks.length - 1 ? "This Week" : `Week of ${startStr}`}
            </button>
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex gap-4 mb-6 flex-wrap">
        {[...activities].map((act) => (
          <div
            key={act}
            className="flex items-center gap-2 cursor-pointer select-none p-2 rounded-md transition-colors"
            style={{
              backgroundColor: hoveredActivity === act ? `${activityColors[act]}20` : "transparent",
              border: `1px solid ${activityColors[act]}40`,
            }}
            onMouseEnter={() => setHoveredActivity(act)}
            onMouseLeave={() => setHoveredActivity(null)}
          >
            <span className="w-4 h-4 rounded-sm" style={{ backgroundColor: activityColors[act] }} />
            <span className="capitalize text-sm font-medium text-gray-700 dark:text-gray-200">{act}</span>
          </div>
        ))}
      </div>

      {/* Graph */}
      <div className="overflow-x-auto">
        <svg width={width} height={height + margin.top + margin.bottom} className="border border-gray-200 dark:border-gray-700 rounded-md transition-colors">
          {[...Array(25)].map((_, i) => {
            const x = margin.left + (i / 24) * (width - margin.left - margin.right);
            return (
              <g key={i}>
                <line
                  x1={x}
                  y1={margin.top}
                  x2={x}
                  y2={height + margin.top}
                  stroke="#e5e7eb"
                  strokeWidth={1}
                  strokeDasharray="2,2"
                  className="dark:stroke-gray-700 transition-colors"
                />
                <text
                  x={x}
                  y={height + margin.top + 20}
                  fontSize={10}
                  fill="#6b7280"
                  className="dark:fill-gray-400 transition-colors"
                  textAnchor="middle"
                >
                  {i}:00
                </text>
              </g>
            );
          })}

        {weekData.map((hourActivities, h) => {
          const hourWidth = (width - margin.left - margin.right) / 24;
          const left = margin.left + (h / 24) * (width - margin.left - margin.right);

          let stackedOffset = 0;

          // Ensure offline fills remaining minutes
          const totalMinutes = hourActivities.reduce((sum, a) => sum + a.minutes, 0);
          if (totalMinutes < 60) {
            hourActivities.push({ activity: "offline", minutes: 60 - totalMinutes });
          }

          return hourActivities.map((activity, idx) => {
            const rectHeight = (activity.minutes / 60) * height;
            const y = margin.top + height - rectHeight - stackedOffset;
            stackedOffset += rectHeight;
            const isHovered = hoveredActivity === activity.activity;

            return (
              <rect
                key={`${h}-${idx}`}
                x={left}
                y={y}
                width={hourWidth}
                height={rectHeight}
                fill={activityColors[activity.activity]}
                opacity={hoveredActivity ? (isHovered ? 0.9 : 0.3) : 0.7}
                rx={2}
                stroke={isHovered ? "#ffffff" : "none"}
                strokeWidth={isHovered ? 2 : 0}
                style={{ cursor: "pointer", transition: "all 0.5s ease" }}
                onMouseEnter={() => handleActivityHover(activity, h)}
                onMouseMove={handleActivityMove}
                onMouseLeave={handleActivityLeave}
              />
            );
          });
        })}

        </svg>
      </div>

      {/* Tooltip */}
      {tooltipData.visible && (
        <div
          className="fixed px-3 py-2 rounded-md text-sm shadow-lg z-20 pointer-events-none w-48 transition-colors"
          style={{
            left: `${tooltipData.x}px`,
            top: `${tooltipData.y}px`,
            backgroundColor: "#1f2937",
            color: activityColors[tooltipData.activity] || "#ffffff",
            borderLeft: `4px solid ${activityColors[tooltipData.activity] || "#6b7280"}`,
          }}
        >
          <div className="capitalize font-medium mb-1">{tooltipData.activity}</div>
          <div className="text-xs mb-1">{tooltipData.hour}:00</div>
          <div className="text-xs font-semibold">Minutes: {tooltipData.minutes}</div>
        </div>
      )}

      <div className="mt-4 text-sm text-gray-500 dark:text-gray-400 text-center transition-colors">
        Hover over the timeline to see average activity per hour
      </div>
    </div>
  );
};

export default WeeklyActivityGraph;

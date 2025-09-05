import React, { useState, useEffect } from "react";
import { activityColors, activities, getWeekdayName } from "./pages/dummy";
import { fetchDailySummary } from "../api/charts";

const DayActivityGraph = () => {
  const [selectedDay, setSelectedDay] = useState(0); // 0 = today
  const [weekDays, setWeekDays] = useState([]); // Array of Date objects for last 7 days
  const [dayData, setDayData] = useState({ summary: [] }); // fetched summary
  const [hoveredActivity, setHoveredActivity] = useState(null);
  const [tooltipData, setTooltipData] = useState({
    visible: false,
    x: 0,
    y: 0,
    activity: "",
    startTime: "",
    endTime: "",
    totalDuration: "",
  });

  const width = 1000;
  const height = 100;
  const margin = { top: 20, right: 20, bottom: 40, left: 60 };

  // --- Initialize last 7 days
  useEffect(() => {
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      days.push(new Date(d));
    }
    setWeekDays(days);
  }, []);

  // --- Fetch daily summary for selected day
  useEffect(() => {
    if (!weekDays.length) return;

    const selectedDate = weekDays[selectedDay].toISOString().split("T")[0];
    fetchDailySummary(selectedDate)
      .then((data) => setDayData(data))
      .catch((err) => console.error(err));
  }, [selectedDay, weekDays]);

  const timeToPercent = (time) => {
    const [h, m] = time.split(":").map(Number);
    return ((h * 60 + m) / 1440) * 100;
  };

  const calculateTotalDuration = (activity) => {
    let totalMinutes = 0;
    activity.intervals.forEach(({ start, end }) => {
      const [sh, sm] = start.split(":").map(Number);
      const [eh, em] = end.split(":").map(Number);
      totalMinutes += (eh * 60 + em) - (sh * 60 + sm);
    });
    const h = Math.floor(totalMinutes / 60);
    const m = totalMinutes % 60;
    return `${h}h ${m}m`;
  };

  const handleActivityHover = (activity, interval) => {
    setHoveredActivity(activity.activity);
    setTooltipData({
      visible: true,
      x: 0,
      y: 0,
      activity: activity.activity,
      startTime: interval.start,
      endTime: interval.end,
      totalDuration: calculateTotalDuration(activity),
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
        Daily Activity Timeline
      </h2>

      {/* Day selector */}
      <div className="flex gap-2 mb-4 flex-wrap">
        {weekDays.map((day, idx) => (
          <button
            key={idx}
            className={`px-3 py-1 rounded-md font-medium text-sm transition-colors ${
              selectedDay === idx
                ? "bg-blue-600 text-white"
                : "bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200"
            }`}
            onClick={() => setSelectedDay(idx)}
          >
            {idx === weekDays.length - 1 ? "Today" : getWeekdayName(day)}
          </button>
        ))}
      </div>

      {/* Legend */}
      <div className="flex gap-4 mb-6 flex-wrap">
        {activities.map((act) => (
          <div
            key={act}
            className="flex items-center gap-2 cursor-pointer select-none p-2 rounded-md transition-colors"
            style={{
              backgroundColor: hoveredActivity === act ? `${activityColors[act]}20` : 'transparent',
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

      <div className="overflow-x-auto">
        <svg
          width={width}
          height={height + margin.top + margin.bottom}
          className="border border-gray-200 dark:border-gray-700 rounded-md transition-colors"
        >
          {/* Background grid */}
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

          {/* Activity rectangles */}
          {dayData.summary?.map((activity) =>
            activity.intervals?.map((interval, idx) => {
              const left = margin.left + (timeToPercent(interval.start) / 100) * (width - margin.left - margin.right);
              const right = margin.left + (timeToPercent(interval.end) / 100) * (width - margin.left - margin.right);
              const rectWidth = right - left;
              const isHovered = hoveredActivity === activity.activity;

              return (
                <rect
                  key={`${activity.activity}-${idx}`}
                  x={left}
                  y={margin.top}
                  width={rectWidth}
                  height={height}
                  fill={activityColors[activity.activity]}
                  opacity={hoveredActivity ? (isHovered ? 0.9 : 0.3) : 0.7}
                  rx={4}
                  stroke={isHovered ? "#ffffff" : "none"}
                  strokeWidth={isHovered ? 2 : 0}
                  style={{
                    cursor: "pointer",
                    zIndex: isHovered ? 10 : 1,
                    transition: "all 0.5s ease",
                  }}
                  onMouseEnter={() => handleActivityHover(activity, interval)}
                  onMouseMove={handleActivityMove}
                  onMouseLeave={handleActivityLeave}
                />
              );
            })
          )}
        </svg>
      </div>

      {/* Tooltip */}
      {tooltipData.visible && (
        <div
          className="fixed px-3 py-2 rounded-md text-sm shadow-lg z-20 pointer-events-none w-48 transition-colors"
          style={{
            left: `${tooltipData.x}px`,
            top: `${tooltipData.y}px`,
            backgroundColor: "#1f2937", // dark background
            color: activityColors[tooltipData.activity] || "#ffffff",
            borderLeft: `4px solid ${activityColors[tooltipData.activity] || '#6b7280'}`,
          }}
        >
          <div className="capitalize font-medium mb-1">{tooltipData.activity}</div>
          <div className="text-xs mb-1">{tooltipData.startTime} - {tooltipData.endTime}</div>
          <div className="text-xs font-semibold">Total: {tooltipData.totalDuration}</div>
        </div>
      )}

      <div className="mt-4 text-sm text-gray-500 dark:text-gray-400 text-center transition-colors">
        Hover over the timeline to see activity details
      </div>
    </div>
  );
};

export default DayActivityGraph;

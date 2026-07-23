import React, { useState, useEffect } from "react";
import { activityColors, activities, LEGACY_COLOR } from "./pages/chartsHelper";
import API from "../api/API";

const DayActivityGraph = () => {
  const [selectedDay, setSelectedDay] = useState(0); // 0 = today
  const [weekDays, setWeekDays] = useState([]);
  const [dayData, setDayData] = useState([]); // hourly data
  const [hoveredActivity, setHoveredActivity] = useState(null);
  const [tooltipData, setTooltipData] = useState({
    visible: false,
    x: 0,
    y: 0,
    activity: "",
    hour: "",
    minutes: 0,
  });

  const getWeekdayName = (date) =>
    date.toLocaleDateString("en-US", { weekday: "short" });

  const width = 1000;
  const height = 100;
  const margin = { top: 20, right: 20, bottom: 40, left: 60 };

  // --- Initialize last 7 days, today first
  useEffect(() => {
    const days = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date();
      d.setDate(d.getDate() - i); // today, yesterday, ...
      days.push(new Date(d));
    }
    setWeekDays(days);
  }, []);

  // --- Fetch daily data for selected day
  useEffect(() => {
    if (!weekDays.length) return;

    const selectedDate = weekDays[selectedDay]
      .toISOString()
      .split("T")[0];

    const fetchDayData = async () => {
      try {
        const res = await API.get(
          `/api/charts/daily?date=${selectedDate}`,
          { withCredentials: true }
        );
        const raw = res.data; // Activity doc for that day

        const hoursArr = [];
        for (let h = 0; h < 24; h++) {
          const hourData = raw.hours?.[h] || {};
          const hourActivities = [];

          for (const [act, mins] of Object.entries(hourData)) {
            if (mins > 0) hourActivities.push({ activity: act, minutes: mins });
          }



          hoursArr.push(hourActivities);
        }

        setDayData(hoursArr);
      } catch (err) {
        console.error(err);
        setDayData([]);
      }
    };

    fetchDayData();
  }, [selectedDay, weekDays]);

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
    <div className="p-6 bg-ui-light dark:bg-ui-dark rounded-2xl border-[1px] border-border-light dark:border-border-dark transition-colors">
      <h2 className="text-lg font-bold mb-4 text-text-light dark:text-text-dark transition-colors">
        Daily Activity Timeline
      </h2>

      {/* Day selector */}
      <div className="flex gap-2 mb-4 flex-wrap">
        {weekDays.map((day, idx) => (
          <button
            key={idx}
            className={`px-3 py-1 rounded-full font-semibold text-sm transition-colors ${
              selectedDay === idx
                ? "bg-accent-light dark:bg-accent text-white dark:text-black"
                : "bg-header-light dark:bg-header-dark text-secondary-light dark:text-secondary-dark"
            }`}
            onClick={() => setSelectedDay(idx)}
          >
            {idx === 0 ? "Today" : getWeekdayName(day)}
          </button>
        ))}
      </div>

      {/* Legend */}
      <div className="flex gap-4 mb-6 flex-wrap">
        {[...activities].map((act) => (
          <div
            key={act}
            className="flex items-center gap-2 cursor-pointer select-none p-2 rounded-md transition-colors"
            style={{
              backgroundColor: hoveredActivity === act ? `${activityColors[act]}20` : "transparent",
              border: `1px solid ${activityColors[act]}`,
            }}
            onMouseEnter={() => setHoveredActivity(act)}
            onMouseLeave={() => setHoveredActivity(null)}
          >
            <span className="w-4 h-4 rounded-sm" style={{ backgroundColor: activityColors[act] }} />
            <span className="capitalize text-sm font-medium text-secondary-light dark:text-secondary-dark">{act}</span>
          </div>
        ))}
      </div>

      {/* Graph */}
      <div className="overflow-x-auto bg-background-light dark:bg-background-dark shadow-sm ">
        <svg
          width={width}
          height={height + margin.top + margin.bottom}
          className="border-[1px] border-border-light dark:border-border-dark rounded-md transition-colors"
        >
          {[...Array(25)].map((_, i) => {
            const x = margin.left + (i / 24) * (width - margin.left - margin.right);
            return (
              <g key={i}>
                <line
                  x1={x}
                  y1={margin.top}
                  x2={x}
                  y2={height + margin.top}
                  strokeWidth={1}
                  strokeDasharray="2,2"
                  className="stroke-border-light dark:stroke-border-dark transition-colors"
                />
                <text
                  x={x}
                  y={height + margin.top + 20}
                  fontSize={10}
                  className="fill-secondary-light dark:fill-secondary-dark transition-colors"
                  textAnchor="middle"
                >
                  {i}:00
                </text>
              </g>
            );
          })}

          {dayData.map((hourActivities, h) => {
            const left = margin.left + (h / 24) * (width - margin.left - margin.right);
            const hourWidth = (width - margin.left - margin.right) / 24;

            let stackedOffset = 0;
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
                  fill={activityColors[activity.activity] || LEGACY_COLOR}
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
          className="fixed px-3 py-2 rounded-md text-sm shadow-lg z-20 pointer-events-none w-48 transition-colors text-gray-300 dark:text-white"
          style={{
            left: `${tooltipData.x}px`,
            top: `${tooltipData.y}px`,
            backgroundColor: "#1f2937",
            borderLeft: `4px solid ${activityColors[tooltipData.activity] || LEGACY_COLOR}`,
          }}
        >
          <div className="capitalize font-medium mb-1">{tooltipData.activity}</div>
          <div className="text-xs mb-1">{tooltipData.hour}:00</div>
          <div className="text-xs font-semibold">Minutes: {tooltipData.minutes}</div>
        </div>
      )}

      <div className="mt-4 text-sm text-gray-500 dark:text-gray-400 text-center transition-colors">
        Hover over the timeline to see activity details
      </div>
    </div>
  );
};

export default DayActivityGraph;

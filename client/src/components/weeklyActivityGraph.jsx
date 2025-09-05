import React, { useState, useMemo } from "react";
import { dummyLast4Weeks, activityColors, activities } from "./pages/dummy1";

const EnhancedWeeklyActivityGraph = ({ data = dummyLast4Weeks }) => {
  const [selectedWeek, setSelectedWeek] = useState(0);
  const [hoveredActivity, setHoveredActivity] = useState(null);
  const [tooltip, setTooltip] = useState({
    visible: false,
    x: 0,
    y: 0,
    activity: "",
    time: "",
    minuteIndex: undefined,
  });

  const weekData = data[selectedWeek];
  const width = 1000;
  const height = 400;
  const margin = { top: 20, right: 20, bottom: 40, left: 60 };

  // Compute last 4 completed weeks start and end dates
  const weekLabels = useMemo(() => {
    const labels = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Go to last Sunday
    const lastSunday = new Date(today);
    lastSunday.setDate(today.getDate() - today.getDay());

    for (let i = 3; i >= 0; i--) {
      const end = new Date(lastSunday);
      end.setDate(lastSunday.getDate() - 7 * i);
      const start = new Date(end);
      start.setDate(end.getDate() - 6);

      const format = (d) =>
        `${String(d.getDate()).padStart(2, "0")}/${
          String(d.getMonth() + 1).padStart(2, "0")
        }`;

      labels.push(`${format(start)} - ${format(end)}`);
    }
    return labels;
  }, []);

  // Precompute line points for each activity
  const chartData = useMemo(() => {
    if (!weekData) return [];
    return activities.map((activity) => {
      const points = weekData.summary.map((d, i) => {
        const x =
          margin.left +
          (i / (weekData.summary.length - 1)) * (width - margin.left - margin.right);
        const y =
          margin.top +
          (height - margin.top - margin.bottom) -
          ((d.distribution[activity] || 0) * (height - margin.top - margin.bottom));
        return { x, y, value: d.distribution[activity] || 0, time: d.time };
      });
      return { activity, points };
    });
  }, [weekData, width, height, margin]);

  const handleMouseMove = (e) => {
    if (!weekData) return;
    const svgRect = e.currentTarget.getBoundingClientRect();
    const xPos = e.clientX - svgRect.left;
    const minuteIndex = Math.min(
      weekData.summary.length - 1,
      Math.max(
        0,
        Math.round(
          ((xPos - margin.left) / (width - margin.left - margin.right)) *
            (weekData.summary.length - 1)
        )
      )
    );

    setTooltip({
      visible: true,
      x: e.clientX,
      y: e.clientY - 70,
      time: weekData.summary[minuteIndex].time,
      minuteIndex,
    });
  };

  const handleMouseLeave = () => {
    setTooltip({ ...tooltip, visible: false });
  };

  return (
    <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md">
      <h2 className="text-xl font-bold mb-4 text-gray-800 dark:text-white">
        Weekly Activity Line Chart
      </h2>

      {/* Week Selector */}
      <div className="flex gap-2 mb-4 flex-wrap">
        {weekLabels.map((label, idx) => (
          <button
            key={idx}
            className={`px-3 py-1 rounded transition ${
              selectedWeek === idx
                ? "bg-blue-600 text-white"
                : "bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200"
            }`}
            onClick={() => setSelectedWeek(idx)}
          >
            {label}
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
              backgroundColor:
                hoveredActivity === act ? `${activityColors[act]}20` : "transparent",
              border: `1px solid ${activityColors[act]}40`,
            }}
            onMouseEnter={() => setHoveredActivity(act)}
            onMouseLeave={() => setHoveredActivity(null)}
          >
            <span
              className="w-4 h-4 rounded-sm"
              style={{ backgroundColor: activityColors[act] }}
            />
            <span className="capitalize text-sm font-medium text-gray-700 dark:text-gray-200">
              {act}
            </span>
          </div>
        ))}
      </div>

      {/* Chart */}
      <div className="overflow-x-auto">
        <svg
          width={width}
          height={height}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          className="border border-gray-200 dark:border-gray-700 rounded-md"
        >
          {/* Vertical grid */}
          {[...Array(25)].map((_, i) => {
            const x = margin.left + (i * (width - margin.left - margin.right)) / 24;
            return (
              <g key={i}>
                <line
                  x1={x}
                  y1={margin.top}
                  x2={x}
                  y2={height - margin.bottom}
                  stroke="#e5e7eb"
                  strokeWidth={1}
                  strokeDasharray="2,2"
                />
                <text
                  x={x}
                  y={height - 10}
                  fontSize={10}
                  fill="#6b7280"
                  textAnchor="middle"
                >
                  {i}:00
                </text>
              </g>
            );
          })}

          {/* Horizontal grid */}
          {[0, 0.25, 0.5, 0.75, 1].map((val, i) => {
            const y =
              margin.top +
              (height - margin.top - margin.bottom) -
              val * (height - margin.top - margin.bottom);
            return (
              <g key={i}>
                <line
                  x1={margin.left}
                  y1={y}
                  x2={width - margin.right}
                  y2={y}
                  stroke="#e5e7eb"
                  strokeWidth={1}
                  strokeDasharray="2,2"
                />
                <text
                  x={margin.left - 10}
                  y={y + 4}
                  fontSize={10}
                  fill="#6b7280"
                  textAnchor="end"
                >
                  {(val * 100).toFixed(0)}%
                </text>
              </g>
            );
          })}

          {/* Activity lines */}
          {chartData.map((activity) => (
            <path
              key={activity.activity}
              d={activity.points
                .map((p, i) => `${i === 0 ? "M" : "L"} ${p.x},${p.y}`)
                .join(" ")}
              fill="none"
              stroke={activityColors[activity.activity]}
              strokeWidth={2}
              opacity={hoveredActivity && hoveredActivity !== activity.activity ? 0.3 : 1}
            />
          ))}

          {/* Hover line */}
          {tooltip.visible && tooltip.minuteIndex !== undefined && (
            <line
              x1={
                margin.left +
                (tooltip.minuteIndex / (weekData.summary.length - 1)) *
                  (width - margin.left - margin.right)
              }
              y1={margin.top}
              x2={
                margin.left +
                (tooltip.minuteIndex / (weekData.summary.length - 1)) *
                  (width - margin.left - margin.right)
              }
              y2={height - margin.bottom}
              stroke="#374151"
              strokeWidth={1}
              strokeDasharray="4,2"
            />
          )}
        </svg>
      </div>

      {/* Tooltip */}
      {tooltip.visible &&
        tooltip.minuteIndex !== undefined &&
        weekData.summary[tooltip.minuteIndex] && (
          <div
            className="fixed bg-gray-800 text-white px-3 py-2 rounded-md text-sm shadow-lg z-20 pointer-events-none w-48"
            style={{
              left: `${tooltip.x}px`,
              top: `${tooltip.y}px`,
              borderLeft: `4px solid ${activityColors[activities[0]] || "#6b7280"}`,
            }}
          >
            <div className="capitalize font-medium mb-1">Time: {tooltip.time}</div>
            <div className="flex h-3 w-full rounded overflow-hidden mb-2 border border-gray-600">
              {activities.map((act) => {
                const val =
                  weekData.summary[tooltip.minuteIndex].distribution[act] || 0;
                return (
                  <div
                    key={act}
                    className="h-full"
                    style={{ width: `${val * 100}%`, backgroundColor: activityColors[act] }}
                  />
                );
              })}
            </div>
            {activities.map((act) => {
              const val =
                weekData.summary[tooltip.minuteIndex].distribution[act] || 0;
              if (val > 0)
                return (
                  <div key={act} className="flex justify-between">
                    <span className="capitalize">{act}</span>
                    <span>{(val * 100).toFixed(1)}%</span>
                  </div>
                );
              return null;
            })}
          </div>
        )}

      <div className="mt-4 text-sm text-gray-500 dark:text-gray-400 text-center">
        Hover over the chart to see activity distribution at specific times
      </div>
    </div>
  );
};

export default EnhancedWeeklyActivityGraph;

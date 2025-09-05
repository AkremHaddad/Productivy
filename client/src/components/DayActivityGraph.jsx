import React, { useState } from "react";
import { dummyDaySummary, activityColors } from "./pages/dummy";

// Define activities to ensure consistent ordering
const activities = Object.keys(activityColors);

const DayActivityGraph = ({ data = dummyDaySummary }) => {
  const [hoveredActivity, setHoveredActivity] = useState(null);
  const [tooltipData, setTooltipData] = useState({
    visible: false,
    x: 0,
    y: 0,
    activity: "",
    startTime: "",
    endTime: "",
  });

  const width = 1000;
  const height = 100;
  const margin = { top: 20, right: 20, bottom: 40, left: 60 };

  // Convert "HH:MM" to percentage of day (0-100%)
  const timeToPercent = (time) => {
    const [h, m] = time.split(":").map(Number);
    return ((h * 60 + m) / 1440) * 100;
  };

  // Handle mouse entering an activity segment
  // When the mouse enters an activity
const handleActivityHover = (activity, interval) => {
  setHoveredActivity(activity.activity);
  setTooltipData({
    visible: true,
    x: 0,
    y: 0,
    activity: activity.activity,
    startTime: interval.start,
    endTime: interval.end,
  });
};

// When the mouse moves over the rectangle
const handleActivityMove = (e) => {
  setTooltipData((prev) => ({
    ...prev,
    x: e.clientX,
    y: e.clientY - 70,
  }));
};

// When the mouse leaves
const handleActivityLeave = () => {
  setHoveredActivity(null);
  setTooltipData((prev) => ({ ...prev, visible: false }));
};


  return (
    <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md">
      <h2 className="text-xl font-bold mb-4 text-gray-800 dark:text-white">
        Daily Activity Timeline
      </h2>

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
          className="border border-gray-200 dark:border-gray-700 rounded-md"
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
                />
                <text
                  x={x}
                  y={height + margin.top + 20}
                  fontSize={10}
                  fill="#6b7280"
                  textAnchor="middle"
                >
                  {i}:00
                </text>
              </g>
            );
          })}

          {/* Activity Rectangles */}
          {data.summary.map((activity) =>
            activity.intervals.map((interval, idx) => {
              const left = timeToPercent(interval.start);
              const right = timeToPercent(interval.end);
              const rectWidth = right - left;
              const isHovered = hoveredActivity === activity.activity;

              return (
                <rect
                  key={`${activity.activity}-${idx}`}
                  x={margin.left + (left / 100) * (width - margin.left - margin.right)}
                  y={margin.top}
                  width={(rectWidth / 100) * (width - margin.left - margin.right)}
                  height={height}
                  fill={activityColors[activity.activity]}
                  opacity={hoveredActivity ? (isHovered ? 0.9 : 0.3) : 0.7}
                  rx={4}
                  stroke={isHovered ? "#ffffff" : "none"}
                  strokeWidth={isHovered ? 2 : 0}
                  style={{ cursor: "pointer", zIndex: isHovered ? 10 : 1 }}
                  onMouseEnter={() => handleActivityHover(activity, interval)}
                  onMouseMove={handleActivityMove}       // <-- add this
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
          className="fixed bg-gray-800 text-white px-3 py-2 rounded-md text-sm shadow-lg z-20 pointer-events-none w-48"
          style={{
            left: `${tooltipData.x}px`,
            top: `${tooltipData.y}px`,
            borderLeft: `4px solid ${activityColors[tooltipData.activity] || '#6b7280'}`,
          }}
        >
          <div className="capitalize font-medium mb-1">{tooltipData.activity}</div>
          <div>{tooltipData.startTime} - {tooltipData.endTime}</div>
        </div>
      )}

      <div className="mt-4 text-sm text-gray-500 dark:text-gray-400 text-center">
        Hover over the timeline to see activity details
      </div>
    </div>
  );
};

export default DayActivityGraph;
import React, { useState } from "react";
import { dummyDaySummary } from "./pages/dummy";

// Define a unique color for each activity
const activityColors = {
  working: "#4f46e5",
  learning: "#16a34a",
  sleeping: "#0ea5e9",
  training: "#f59e0b",
  playing: "#ef4444",
  socializing: "#e11d48",
  hobbying: "#f97316",
  others: "#6b7280"
};

const DayActivityGraph = ({ data = dummyDaySummary }) => {
  const [hoveredActivity, setHoveredActivity] = useState(null);
  const [tooltipData, setTooltipData] = useState({ 
    visible: false, 
    x: 0, 
    y: 0, 
    activity: "", 
    startTime: "" 
  });

  // Convert "HH:MM" to percentage of day (0-100%)
  const timeToPercent = (time) => {
    const [h, m] = time.split(":").map(Number);
    return ((h * 60 + m) / 1440) * 100;
  };

  // Handle mouse entering an activity segment
  const handleActivityHover = (activity, interval, e) => {
    setHoveredActivity(activity.activity);
    
    // Get position for tooltip
    const rect = e.target.getBoundingClientRect();
    setTooltipData({
        visible: true,
        x: e.clientX,
        y: e.clientY - 40, // hover above cursor
        activity: activity.activity,
        startTime: interval.start,
        endTime: interval.end
        });
  };

  // Handle mouse leaving an activity segment
  const handleActivityLeave = () => {
    setHoveredActivity(null);
    setTooltipData({
      ...tooltipData,
      visible: false
    });
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-4">
      {/* Activity Legend */}
      <div className="flex gap-4 mb-4 flex-wrap">
        {Object.keys(activityColors).map(act => (
          <div
            key={act}
            className="flex items-center gap-2 cursor-pointer select-none"
            onMouseEnter={() => setHoveredActivity(act)}
            onMouseLeave={() => setHoveredActivity(null)}
          >
            <span
              className="w-4 h-4 rounded-sm"
              style={{ backgroundColor: activityColors[act] }}
            ></span>
            <span className="capitalize">{act}</span>
          </div>
        ))}
      </div>

      {/* Timeline Container */}
      <div className="relative h-24 border-t border-b border-gray-300 dark:border-gray-600">
        {/* Horizontal 24-hour markers */}
        {[...Array(25)].map((_, i) => (
          <div
            key={i}
            className="absolute top-0 h-full border-l border-gray-200 dark:border-gray-700"
            style={{ left: `${(i / 24) * 100}%` }}
          >
            <span className="absolute -top-6 text-xs text-gray-500 dark:text-gray-400">
              {i}:00
            </span>
          </div>
        ))}

        {/* Activity Rectangles */}
        {data.summary.map((activity) => 
          activity.intervals.map((interval, idx) => {
            const left = timeToPercent(interval.start);
            const right = timeToPercent(interval.end);
            const width = right - left;
            const isHovered = hoveredActivity === activity.activity;
            
            return (
              <div
                key={`${activity.activity}-${idx}`}
                className="absolute top-0 h-full rounded-sm transition-all duration-200 cursor-pointer"
                style={{
                  left: `${left}%`,
                  width: `${width}%`,
                  backgroundColor: activityColors[activity.activity],
                  opacity: hoveredActivity
                    ? isHovered
                      ? 0.9
                      : 0.3
                    : 0.7,
                  border: isHovered ? "2px solid white" : "none",
                  zIndex: isHovered ? 10 : 1
                }}
                onMouseEnter={(e) => handleActivityHover(activity, interval, e)}
                onMouseLeave={handleActivityLeave}
              />
            );
          })
        )}
      </div>

        {/* Tooltip */}
        {tooltipData.visible && (
        <div
          className="fixed bg-gray-800 text-white px-3 py-2 rounded-md text-sm shadow-lg z-20"
          style={{
            left: `${tooltipData.x}px`,
            top: `${tooltipData.y}px`,
            transform: 'translateX(-50%)'
            }}
        >
            <div className="capitalize font-medium">{tooltipData.activity}</div>
            <div>{tooltipData.startTime} - {tooltipData.endTime}</div>
        </div>
        )}
    </div>
  );
};

export default DayActivityGraph;
import React, { useState, useMemo, useRef } from "react";
import { dummyWeeklySummary, activityColors, activities } from "./pages/dummy1";
import * as d3 from "d3";

const EnhancedWeeklyActivityGraph = ({ data = dummyWeeklySummary }) => {
  const [tooltip, setTooltip] = useState({ visible: false, x: 0, y: 0, time: "", distributions: {} });
  const svgRef = useRef(null);

  const width = 1000;
  const height = 400;
  const margin = { top: 20, right: 20, bottom: 40, left: 60 };

  // Memoize the chart data and scales
  const { xScale, yScale, stackedAreas } = useMemo(() => {
    const xScale = d3
      .scaleLinear()
      .domain([0, 1439])
      .range([margin.left, width - margin.right]);

    const yScale = d3
      .scaleLinear()
      .domain([0, 1])
      .range([height - margin.bottom, margin.top]);

    // Compute stacked areas
    const stack = d3.stack().keys(activities);
    const stackedData = stack(
      data.summary.map((d, i) => ({
        ...d.distribution,
        timeIndex: i,
      }))
    );

    const stackedAreas = stackedData.map((series) => {
      const points = series.map((d, i) => ({
        x: xScale(i),
        y0: yScale(d[0]),
        y1: yScale(d[1]),
        time: data.summary[i].time,
        value: d[1] - d[0],
      }));
      return { activity: series.key, points };
    });

    return { xScale, yScale, stackedAreas };
  }, [data, width, height, margin]);

  // Handle mouse movement
  const handleMouseMove = (e) => {
    const svgRect = svgRef.current.getBoundingClientRect();
    const xPos = e.clientX - svgRect.left;
    const minuteIndex = Math.min(
      1439,
      Math.max(0, Math.round(xScale.invert(xPos - margin.left)))
    );

    if (data.summary[minuteIndex]) {
      setTooltip({
        visible: true,
        x: e.clientX,
        y: e.clientY - 80,
        time: data.summary[minuteIndex].time,
        distributions: data.summary[minuteIndex].distribution,
      });
    }
  };

  const handleMouseLeave = () => {
    setTooltip({ ...tooltip, visible: false });
  };

  return (
    <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md w-full max-w-5xl mx-auto">
      <h2 className="text-xl font-bold mb-4 text-gray-800 dark:text-white">
        Weekly Activity Distribution
      </h2>

      {/* Legend */}
      <div className="flex gap-4 mb-6 flex-wrap justify-center">
        {activities.map((act) => (
          <div
            key={act}
            className="flex items-center gap-2 cursor-pointer select-none p-2 rounded-md transition-colors hover:bg-gray-100 dark:hover:bg-gray-700"
            onMouseEnter={() => setTooltip((prev) => ({ ...prev, highlightedActivity: act }))}
            onMouseLeave={() => setTooltip((prev) => ({ ...prev, highlightedActivity: null }))}
            role="button"
            tabIndex={0}
            aria-label={`Highlight ${act} activity`}
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

      {/* Chart Container */}
      <div className="overflow-x-auto">
        <svg
          ref={svgRef}
          width={width}
          height={height}
          className="border border-gray-200 dark:border-gray-700 rounded-md"
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          role="img"
          aria-label="Weekly activity distribution chart"
        >
          {/* Background grid */}
          {[...Array(13)].map((_, i) => {
            const x = xScale(i * 120); // Every 2 hours
            return (
              <line
                key={`grid-x-${i}`}
                x1={x}
                y1={margin.top}
                x2={x}
                y2={height - margin.bottom}
                stroke="#e5e7eb"
                strokeWidth={1}
                strokeDasharray="2,2"
              />
            );
          })}
          {[0, 0.25, 0.5, 0.75, 1].map((val) => {
            const y = yScale(val);
            return (
              <line
                key={`grid-y-${val}`}
                x1={margin.left}
                y1={y}
                x2={width - margin.right}
                y2={y}
                stroke="#e5e7eb"
                strokeWidth={1}
                strokeDasharray="2,2"
              />
            );
          })}

          {/* Axes */}
          {[...Array(25)].map((_, i) => {
            const x = xScale(i * 60);
            return (
              <g key={`axis-x-${i}`}>
                <line
                  x1={x}
                  y1={height - margin.bottom}
                  x2={x}
                  y2={height - margin.bottom + 5}
                  stroke="#6b7280"
                  strokeWidth={1}
                />
                <text
                  x={x}
                  y={height - margin.bottom + 20}
                  fontSize={10}
                  fill="#6b7280"
                  textAnchor="middle"
                >
                  {i}:00
                </text>
              </g>
            );
          })}
          {[0, 0.25, 0.5, 0.75, 1].map((val) => {
            const y = yScale(val);
            return (
              <g key={`axis-y-${val}`}>
                <line
                  x1={margin.left - 5}
                  y1={y}
                  x2={margin.left}
                  y2={y}
                  stroke="#6b7280"
                  strokeWidth={1}
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

          {/* Stacked Areas */}
          {stackedAreas.map((area) => (
            <path
              key={area.activity}
              d={d3
                .area()
                .x((d) => d.x)
                .y0((d) => d.y0)
                .y1((d) => d.y1)
                .curve(d3.curveMonotoneX)(area.points)}
              fill={activityColors[area.activity]}
              stroke={activityColors[area.activity]}
              strokeWidth={0.5}
              opacity={tooltip.highlightedActivity && tooltip.highlightedActivity !== area.activity ? 0.3 : 0.8}
              style={{ transition: "opacity 0.2s" }}
              onMouseEnter={() => setTooltip((prev) => ({ ...prev, highlightedActivity: area.activity }))}
            />
          ))}

          {/* Hover Line */}
          {tooltip.visible && (
            <line
              x1={xScale(
                parseInt(tooltip.time.split(":")[0]) * 60 + parseInt(tooltip.time.split(":")[1])
              )}
              y1={margin.top}
              x2={xScale(
                parseInt(tooltip.time.split(":")[0]) * 60 + parseInt(tooltip.time.split(":")[1])
              )}
              y2={height - margin.bottom}
              stroke="#374151"
              strokeWidth={1}
              strokeDasharray="4,2"
            />
          )}
        </svg>
      </div>

      {/* Tooltip */}
      {tooltip.visible && (
        <div
          className="fixed bg-gray-800 text-white px-4 py-3 rounded-md text-sm shadow-lg z-20 max-w-xs"
          style={{
            left: `${tooltip.x}px`,
            top: `${tooltip.y}px`,
            borderLeft: `4px solid ${activityColors[tooltip.highlightedActivity] || "#6b7280"}`,
          }}
        >
          <div className="font-medium mb-1">Time: {tooltip.time}</div>
          {Object.entries(tooltip.distributions)
            .filter(([, value]) => value > 0)
            .sort(([, a], [, b]) => b - a)
            .map(([act, value]) => (
              <div key={act} className="flex items-center gap-2">
                <span
                  className="w-3 h-3 rounded-sm"
                  style={{ backgroundColor: activityColors[act] }}
                />
                <span className="capitalize">
                  {act}: {(value * 100).toFixed(1)}%
                </span>
              </div>
            ))}
        </div>
      )}

      {/* Chart Footer */}
      <div className="mt-4 text-sm text-gray-500 dark:text-gray-400 text-center">
        Hover over the chart or legend to explore activity distributions
      </div>
    </div>
  );
};

export default EnhancedWeeklyActivityGraph;
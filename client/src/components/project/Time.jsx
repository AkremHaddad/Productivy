import React from "react";

const Time = ({ minutesWorked }) => {
  const formatTime = (totalMinutes) => {
    const h = Math.floor(totalMinutes / 60);
    const m = totalMinutes % 60;
    if (h > 0 && m > 0) return `${h}h ${m}m`;
    if (h > 0) return `${h}h`;
    return `${m}m`;
  };

  return (
    <div className="flex-1 flex flex-col justify-evenly items-center p-2 justify-around dark:bg-inherit h-[150px] rounded-r-md">
      <div className="font-jaro text-md text-white text-center">time worked today</div>
      <div className="font-jaro text-md text-[#C3C3C3] text-center">
        {formatTime(minutesWorked)}
      </div>
    </div>
  );
};

export default Time;

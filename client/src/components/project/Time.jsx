import React from "react";
import { useActivity } from "../../api/useActivity";
import { formatTime } from "../../utils/formatTime";

const Time = () => {
  const { minutesWorkedToday } = useActivity();

  return (
    <div className="flex-1 flex flex-col justify-evenly items-center p-2 justify-around dark:bg-inherit h-[150px] rounded-r-md">
      <div className="font-jaro text-md text-black dark:text-white text-center">time worked today</div>
      <div className="font-jaro text-md text-black dark:text-white text-center">
        {formatTime(minutesWorkedToday)}
      </div>
    </div>
  );
};

export default Time;

import React from "react";

const Tabs = ({ showTools, setShowTools }) => {
  return (
    <div className="select-none flex flex-row gap-1 p-1 fixed left-1/2 transform -translate-x-1/2 bottom-4 rounded-lg w-32 h-12 bg-white dark:bg-gray-950 border border-gray-800">
      <div
        onClick={() => setShowTools(prev => !prev)} // toggle tools section
        className={`flex-1 flex items-center justify-center m-0.5 rounded-lg font-medium cursor-pointer
          ${
            showTools
              ? "bg-blue-500 text-white dark:bg-blue-800 dark:text-white"
              : "bg-gray-200 dark:bg-[#1c2b41] text-blue-800 dark:text-blue-400"
          }`}
      >
        Tools
      </div>
      {/* <div className='flex-1 flex items-center justify-center m-0.5 bg-gray-200 dark:bg-primary-dark text-blue-800 dark:text-blue-400 rounded-lg font-medium'>Board</div> */}
    </div>
  );
};

export default Tabs;

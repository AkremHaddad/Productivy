import React from "react";

const Tabs = ({ showTools, setShowTools }) => {
  return (
    <div className="select-none flex flex-row gap-1 p-1 fixed left-1/2 transform -translate-x-1/2 bottom-4 rounded-lg w-32 h-12 bg-white dark:bg-gray-950 border-2 border-gray-800">
      <div
        onClick={() => setShowTools(prev => !prev)} // toggle tools section
        className={`flex-1 flex items-center justify-center m-0.5 rounded-lg font-medium cursor-pointer hover:bg-gray-500 dark:hover:bg-gray-800
          ${
            showTools
              ? "bg-accent/60 dark:bg-accent/40 text-black/40  dark:text-accent"
              : "bg-inherit text-black dark:text-white"
          }`}
      >
        Tools
      </div>
      {/* <div className='flex-1 flex items-center justify-center m-0.5 bg-gray-200 dark:bg-primary-dark text-blue-800 dark:text-blue-400 rounded-lg font-medium'>Board</div> */}
    </div>
  );
};

export default Tabs;

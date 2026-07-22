import React from "react";

const Tabs = ({ showTools, setShowTools }) => {
  return (
    <div className="select-none flex flex-row gap-1 p-1 fixed z-40 left-1/2 transform -translate-x-1/2 bottom-4
    rounded-full w-32 h-11 bg-header-light dark:bg-header-dark border-[1px] border-border-light dark:border-border-dark shadow-lg">
      <div
        onClick={() => setShowTools(prev => !prev)} // toggle tools section
        className={`flex-1 flex items-center justify-center gap-1.5 rounded-full font-semibold text-sm cursor-pointer transition-colors text-text-light dark:text-text-dark
          ${
            showTools
              ? "bg-accent text-black"
              : "hover:bg-black/10 dark:hover:bg-white/10"
          }`}
      >
        <span aria-hidden="true">⚙</span> Tools
      </div>
    </div>
  );
};

export default Tabs;

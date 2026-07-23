import React from "react";

const OPTIONS = [
  { value: "all", label: "All" },
  { value: "sprints", label: "Sprints" },
  { value: "board", label: "Board" },
];

// Shown on every screen size now, not just mobile - it's a real "focus on
// just this" switcher, not only a way to avoid squeezing two panes onto a
// narrow phone width.
const Tabs = ({ viewMode, setViewMode }) => {
  return (
    <div className="select-none flex flex-row gap-1 p-1 fixed z-40 left-1/2 transform -translate-x-1/2 bottom-4
    rounded-full bg-header-light dark:bg-header-dark border-[1px] border-border-light dark:border-border-dark shadow-lg">
      {OPTIONS.map(({ value, label }) => (
        <button
          key={value}
          onClick={() => setViewMode(value)}
          className={`px-4 h-9 flex items-center justify-center rounded-full font-semibold text-sm cursor-pointer transition-colors text-text-light dark:text-text-dark
            ${
              viewMode === value
                ? "bg-accent-light dark:bg-accent text-white dark:text-black"
                : "hover:bg-black/10 dark:hover:bg-white/10"
            }`}
        >
          {label}
        </button>
      ))}
    </div>
  );
};

export default Tabs;

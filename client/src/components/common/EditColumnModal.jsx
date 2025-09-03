import React, { useState, useEffect } from "react";
import { updateColumn } from "../../api/project";
import { useTheme } from "../../api/useTheme";
import { XMarkIcon } from "@heroicons/react/24/outline";

const EditColumnModal = ({ projectId, boardId, column, colors, onClose, onUpdated }) => {
  const [title, setTitle] = useState(column.title);
  const [colorKey, setColorKey] = useState(column.color || "grey");

  const isDarkMode = useTheme(); // <-- boolean, same as Column.jsx

  // Reset state when column changes
  useEffect(() => {
    setTitle(column.title);
    setColorKey(column.color || "grey");
  }, [column]);

  const handleSubmit = async e => {
    e.preventDefault();
    const updated = await updateColumn(projectId, boardId, column._id, {
      title,
      color: colorKey,
    });
    onUpdated(updated);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 backdrop-blur-sm">
      <form
        onSubmit={handleSubmit}
        className="bg-background-light dark:bg-background-dark
                  border-2 border-secondary-dark dark:border-accent
                  p-6 rounded-xl shadow-2xl flex flex-col gap-5 w-full max-w-md relative"
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-3 right-3 p-2 rounded-full hover:bg-white/10 transition"
          title="Close"
        >
          <XMarkIcon className="w-5 h-5 text-text-light dark:text-text-dark" />
        </button>

        {/* Title */}
        <h2 className="text-2xl font-jaro font-bold text-center text-secondary-dark dark:text-accent">
          Edit Column
        </h2>

        {/* Column Title Input */}
        <div className="flex flex-col gap-2">
          <label className="text-text-light dark:text-text-dark font-medium">
            Column Title
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-4 py-2 rounded-lg border-2 border-black dark:border-navbar-dark
                      bg-white dark:bg-navbar-dark
                      text-text-light dark:text-text-dark
                      focus:outline-none focus:ring-1 focus:ring-black"
            placeholder="Enter column title"
          />
        </div>

        {/* Color Picker */}
        <div className="flex flex-col gap-2">
          <label className="text-text-light dark:text-text-dark font-medium">
            Choose Color
          </label>
          <div className="grid grid-cols-4 gap-3">
            {Object.entries(colors).map(([key, col]) => {
              const fillColor = isDarkMode ? col.dark.fill : col.light.fill;
              const borderColor = isDarkMode ? col.dark.border : col.light.border;
              const isSelected = key === colorKey;

              return (
                <button
                  type="button"
                  key={key}
                  onClick={() => setColorKey(key)}
                  className={`flex items-center justify-center rounded-lg p-2 transition-shadow shadow-md
                    ${isSelected ? "bg-accent/20 ring-2 ring-accent" : "hover:bg-black/10 dark:hover:bg-white/10"}`}
                >
                  <div
                    className="w-5 h-5 rounded-full border-[2.5px]"
                    style={{ backgroundColor: fillColor, borderColor }}
                  />
                </button>
              );
            })}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-3 mt-4">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-lg bg-navbar-light dark:bg-navbar-dark
                      text-text-dark hover:bg-opacity-80 border border-transparent dark:hover:border-accent
                      font-medium transition-all"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-5 py-2 rounded-lg bg-secondary-light dark:bg-accent text-white dark:text-black
                      font-bold shadow-md hover:shadow-lg transition-all duration-200
                      hover:scale-[1.02]"
          >
            Save Changes
          </button>
        </div>
      </form>
    </div>

  );
};

export default EditColumnModal;

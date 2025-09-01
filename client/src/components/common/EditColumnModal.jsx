import React, { useState } from "react";
import { updateColumn } from "../../api/project";
import { useTheme } from "../../api/useTheme";

const EditColumnModal = ({ projectId, boardId, column, colors, onClose, onUpdated }) => {
  const [title, setTitle] = useState(column.title);
  const [colorKey, setColorKey] = useState(column.color || "grey");
  const { theme } = useTheme(); // "light" | "dark" | "system"

  const handleSubmit = async e => {
    e.preventDefault();
    const updated = await updateColumn(projectId, boardId, column._id, {
      title,
      color: colorKey,
    });
    onUpdated(updated);
    onClose();
  };

  const isDarkMode = theme === "dark";

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-black rounded-2xl p-6 w-full max-w-md shadow-lg">
        <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-gray-100">
          Edit Column
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            value={title}
            onChange={e => setTitle(e.target.value)}
            className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-light text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-800"
            placeholder="Column title"
          />

          <div>
            <p className="mb-2 font-medium text-gray-900 dark:text-gray-100">Choose Color:</p>
            <div className="grid grid-cols-4 gap-3">
              {Object.entries(colors).map(([key, col]) => (
                <button
                  type="button"
                  key={key}
                  onClick={() => setColorKey(key)}
                  className={`w-8 h-8 rounded-full border-2 ${
                    colorKey === key
                      ? "border-black dark:border-white"
                      : "border-transparent"
                  }`}
                  style={{
                    backgroundColor: isDarkMode ? col.dark.fill : col.light.fill,
                  }}
                />
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700"
            >
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditColumnModal;

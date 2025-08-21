import React, { useState, useEffect } from "react";
import API from "../../api/API";

const Sprints = ({ projectId, selectedSprintId, onSprintSelect }) => {
  const [sprints, setSprints] = useState([]);
  const [sprintTitle, setSprintTitle] = useState("");

  useEffect(() => {
    if (!projectId) return;

    const fetchSprints = async () => {
      try {
        const res = await API.get(`/api/projects/${projectId}`);
        const fetchedSprints = res.data.sprints || [];
        setSprints(fetchedSprints);

        // Auto-select first sprint if none selected
        if (!selectedSprintId && fetchedSprints.length > 0) {
          onSprintSelect(fetchedSprints[0]);
        }
      } catch (err) {
        console.error("Error fetching sprints:", err);
      }
    };

    fetchSprints();
  }, [projectId, selectedSprintId, onSprintSelect]);

  const handleAddSprint = async () => {
    if (!sprintTitle.trim()) return;

    try {
      const res = await API.post(`/api/projects/${projectId}/sprints`, {
        title: sprintTitle,
      });

      setSprints(res.data);
      setSprintTitle("");

      // auto-select newly added sprint
      const newSprint = res.data[res.data.length - 1];
      onSprintSelect(newSprint);
    } catch (err) {
      console.error("Error adding sprint:", err);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddSprint();
    }
  };

  return (
    <div className="flex-1 bg-primary-light dark:bg-primary-dark h-[350px] rounded-md shadow-lg overflow-hidden flex flex-col">
      {/* Header */}
      <div className="bg-black bg-opacity-25 h-[40px] text-white text-center text-lg font-jaro flex items-center justify-center rounded-t-md border-b-2 border-black ">
        Sprints
      </div>

      {/* Sprint List */}
      <div className="flex-1 overflow-y-auto divide-y divide-black dark:divide-white/20">
        {sprints.length === 0 ? (
          <div className="text-center py-8 text-text-light dark:text-text-dark/70">
            <div className="text-4xl mb-2">🏃</div>
            <p>No sprints yet</p>
            <p className="text-sm mt-1">Create your first sprint below</p>
          </div>
        ) : (
          sprints.map((s) => (
            <div
              key={s._id}
              onClick={() => onSprintSelect(s)}
              className={`cursor-pointer px-3 py-2 transition-all duration-200
                ${
                  selectedSprintId === s._id
                    ? "bg-black/25 dark:bg-black/75 text-black dark:text-white"
                    : "hover:bg-black/10 dark:hover:bg-white/10 text-black dark:text-text-dark"
                }`}
            >
              {s.title}
            </div>
          ))
        )}
      </div>

      {/* Add Sprint Form */}
      <div className="flex gap-2 items-center p-2 bg-black/20 border-t-2 border-t-black dark:border-t-black">
        <input
          type="text"
          value={sprintTitle}
          onChange={(e) => setSprintTitle(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Enter a new sprint..."
          className="flex-1 min-w-0 px-2 py-1 rounded-xl border-2 border-navbar-light/30 dark:border-navbar-dark/30
                     bg-ui-light dark:bg-black/50 text-text-light dark:text-text-dark 
                     focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-transparent transition-all"
        />
        <button
          onClick={handleAddSprint}
          disabled={!sprintTitle.trim()}
          className="shrink-0 w-8 h-8 bg-secondary-light text-white rounded-xl
                     hover:opacity-70 disabled:opacity-50 disabled:cursor-not-allowed 
                     transition-all shadow-md hover:shadow-lg flex items-center justify-center"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M12 6v6m0 0v6m0-6h6m-6 0H6"
            ></path>
          </svg>
        </button>
      </div>
    </div>
  );
};

export default Sprints;

import React, { useState, useEffect } from "react";
import API from "../../api/API";

const Sprints = ({ projectId, selectedSprintId, onSprintSelect }) => {
  const [sprints, setSprints] = useState([]);
  const [sprintTitle, setSprintTitle] = useState("");
  const [editingSprint, setEditingSprint] = useState(null);
  const [editTitle, setEditTitle] = useState("");
  const [deleteConfirm, setDeleteConfirm] = useState(null);

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

  // Handle double-click to edit sprint
  const handleDoubleClick = (sprint, e) => {
    e.stopPropagation(); // Prevent sprint selection
    setEditingSprint(sprint._id);
    setEditTitle(sprint.title);
  };

  // Handle edit sprint
  const handleEditSprint = async (sprintId) => {
    if (!editTitle.trim()) return;

    try {
      const res = await API.patch(
        `/api/projects/${projectId}/sprints/${sprintId}`,
        { title: editTitle }
      );
      setSprints(res.data);
      setEditingSprint(null);
      setEditTitle("");
    } catch (err) {
      console.error("Error editing sprint:", err);
    }
  };

  // Handle delete sprint
  const handleDeleteSprint = async (sprintId) => {
    try {
      const res = await API.delete(
        `/api/projects/${projectId}/sprints/${sprintId}`
      );
      setSprints(res.data);
      
      // If deleted sprint was selected, select first available sprint
      if (selectedSprintId === sprintId) {
        const remainingSprints = res.data;
        if (remainingSprints.length > 0) {
          onSprintSelect(remainingSprints[0]);
        } else {
          onSprintSelect(null);
        }
      }
      
      setDeleteConfirm(null);
    } catch (err) {
      console.error("Error deleting sprint:", err);
    }
  };

  // Cancel editing
  const cancelEdit = () => {
    setEditingSprint(null);
    setEditTitle("");
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddSprint();
    }
  };

  // Handle Enter key press for editing sprints
  const handleEditKeyPress = (e, sprintId) => {
    if (e.key === 'Enter') {
      e.stopPropagation();
      handleEditSprint(sprintId);
    } else if (e.key === 'Escape') {
      e.stopPropagation();
      cancelEdit();
    }
  };

  // Handle sprint selection (only when not editing)
  const handleSprintClick = (sprint) => {
    if (editingSprint !== sprint._id) {
      onSprintSelect(sprint);
    }
  };

  return (
    <div className="flex-1 bg-primary-light dark:bg-primary-dark h-[350px] rounded-md shadow-lg overflow-hidden flex flex-col">
      {/* Header */}
      <div className="bg-black bg-opacity-40 h-[40px] text-white text-center text-lg font-jaro flex items-center justify-center rounded-t-md border-b-2 border-black ">
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
              onClick={() => handleSprintClick(s)}
              className={`cursor-pointer px-3 py-2 transition-all duration-200 group flex items-center justify-between
                ${
                  selectedSprintId === s._id
                    ? "bg-black/25 dark:bg-black/75 text-black dark:text-white"
                    : "hover:bg-black/10 dark:hover:bg-white/10 text-black dark:text-text-dark"
                }`}
            >
              <div className="flex-1 min-w-0">
                {editingSprint === s._id ? (
                  <input
                    type="text"
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    onKeyPress={(e) => handleEditKeyPress(e, s._id)}
                    onBlur={() => handleEditSprint(s._id)}
                    className="flex-1 w-full px-0 py-0 bg-transparent border-none focus:outline-none focus:ring-0 text-inherit font-inherit"
                    style={{ fontSize: 'inherit', lineHeight: 'inherit' }}
                    autoFocus
                    onClick={(e) => e.stopPropagation()}
                  />
                ) : (
                  <span 
                    className="block truncate"
                    onDoubleClick={(e) => handleDoubleClick(s, e)}
                    title="Double-click to edit"
                  >
                    {s.title}
                  </span>
                )}
              </div>

              {editingSprint !== s._id && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setDeleteConfirm(s._id);
                  }}
                  className="opacity-0 group-hover:opacity-100 text-red-500 hover:text-red-700 p-1 transition-opacity duration-200 ml-2"
                  title="Delete sprint"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                  </svg>
                </button>
              )}
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

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 backdrop-blur-sm">
          <div className="bg-background-light dark:bg-background-dark 
                          border-2 border-secondary-dark dark:border-accent
                          p-6 rounded-xl shadow-2xl flex flex-col gap-4 w-full max-w-md mx-4">
            <h2 className="text-2xl font-jaro font-bold text-center text-secondary-dark dark:text-accent">
              Delete Sprint
            </h2>
            
            <p className="text-text-light dark:text-text-dark text-center">
              Are you sure you want to delete this sprint? This will also delete all tasks within it. This action cannot be undone.
            </p>
            
            <div className="flex justify-end gap-3 mt-4">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="px-5 py-2 rounded-lg bg-navbar-light dark:bg-navbar-dark 
                          text-text-dark hover:bg-opacity-80 transition-all
                          font-medium border border-transparent hover:border-accent"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeleteSprint(deleteConfirm)}
                className="px-5 py-2 rounded-lg bg-red-500 dark:bg-red-600 text-white
                          font-bold shadow-md hover:shadow-lg
                          transition-all duration-200
                          hover:bg-red-600 dark:hover:bg-red-700
                          transform hover:scale-[1.02]"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Sprints;
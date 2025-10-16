import React, { useState, useEffect } from "react";
import API from "../../api/API";
import Modal from "../common/Modal"; // Adjust path to your Modal.jsx

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
      // Ensure we set sprints as an array
      const updatedSprints = Array.isArray(res.data.sprints)
        ? res.data.sprints
        : Array.isArray(res.data)
        ? res.data
        : [...sprints, res.data]; // Fallback: append single sprint to existing array
      setSprints(updatedSprints);
      setSprintTitle("");
      const newSprint = updatedSprints[updatedSprints.length - 1];
      onSprintSelect(newSprint);
    } catch (err) {
      console.error("Error adding sprint:", err);
    }
  };

  const handleDoubleClick = (sprint, e) => {
    e.stopPropagation();
    setEditingSprint(sprint._id);
    setEditTitle(sprint.title);
  };

  const handleEditSprint = async (sprintId) => {
    if (!editTitle.trim()) return;
    try {
      const res = await API.patch(`/api/projects/${projectId}/sprints/${sprintId}`, {
        title: editTitle,
      });
      // Ensure we set sprints as an array
      const updatedSprints = Array.isArray(res.data.sprints)
        ? res.data.sprints
        : Array.isArray(res.data)
        ? res.data
        : sprints.map((sprint) =>
            sprint._id === sprintId ? { ...sprint, title: editTitle } : sprint
          ); // Fallback: update locally
      setSprints(updatedSprints);
      setEditingSprint(null);
      setEditTitle("");
    } catch (err) {
      console.error("Error editing sprint:", err);
    }
  };

  const handleDeleteSprint = async (sprintId) => {
    try {
      const res = await API.delete(`/api/projects/${projectId}/sprints/${sprintId}`);
      // Ensure we set sprints as an array
      const updatedSprints = Array.isArray(res.data.sprints)
        ? res.data.sprints
        : Array.isArray(res.data)
        ? res.data
        : sprints.filter((sprint) => sprint._id !== sprintId); // Fallback: remove locally
      setSprints(updatedSprints);
      if (selectedSprintId === sprintId) {
        onSprintSelect(updatedSprints[0] || null);
      }
      setDeleteConfirm(null);
    } catch (err) {
      console.error("Error deleting sprint:", err);
    }
  };

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

  const handleEditKeyPress = (e, sprintId) => {
    if (e.key === "Enter") {
      e.stopPropagation();
      handleEditSprint(sprintId);
    } else if (e.key === "Escape") {
      e.stopPropagation();
      cancelEdit();
    }
  };

  const handleSprintClick = (sprint) => {
    if (editingSprint !== sprint._id) onSprintSelect(sprint);
  };

  return (
    <div className="flex-1 bg-ui-light dark:bg-ui-dark h-[460px] rounded-md shadow-lg border-[1px] border-border-light dark:border-border-dark
    overflow-hidden flex flex-col">
      {/* Header */}
      <div className="bg-header-light dark:bg-header-dark h-[40px] text-black dark:text-white text-center text-lg border-b-[1px] border-border-light dark:border-border-dark
      font-jaro flex items-center justify-center rounded-t-md ">
        Sprints
      </div>
      {/* Sprint List */}
      <div className="flex-1 overflow-y-auto">
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
              className={`cursor-pointer px-3 py-2 transition-all duration-200 group flex font-medium m-2 rounded-lg text-black dark:text-white
                          items-center justify-between ${
                selectedSprintId === s._id
                  ? "bg-background-light dark:bg-background-dark  border border-border-light dark:border-border-dark shadow-sm "
                  : ""
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
                    style={{ fontSize: "inherit", lineHeight: "inherit" }}
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
                  className="opacity-0 group-hover:opacity-100 text-white hover:text-red-500 p-1 transition-opacity duration-200 ml-2 rounded bg-black/50"
                  title="Delete sprint"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                    ></path>
                  </svg>
                </button>
              )}
            </div>
          ))
        )}
      </div>
      {/* Add Sprint Form */}
      <div className="flex gap-2 items-center p-2 bg-header-light dark:bg-header-dark border-t-[1px] border-border-light dark:border-border-dark">
        <input
          type="text"
          value={sprintTitle}
          onChange={(e) => setSprintTitle(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Enter a new sprint..."
          className="flex-1 min-w-0 px-2 py-1 rounded-xl border-[1px] border-border-light dark:border-border-dark bg-ui-light
            dark:bg-ui-dark text-text-light dark:text-text-dark focus:outline-none
             focus:ring-2 focus:ring-black dark:focus:ring-white focus:border-transparent transition-all"
        />
        <button
          onClick={handleAddSprint}
          disabled={!sprintTitle.trim()}
          className="shrink-0 w-8 h-8 bg-white dark:bg-black  text-black dark:text-white rounded-xl 
          hover:opacity-70 disabled:opacity-50 disabled:cursor-not-allowed transition-all 
          shadow-sm hover:shadow-lg flex items-center justify-center
          border-[1px] border-border-light dark:border-border-dark"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
          </svg>
        </button>
      </div>
      {/* Delete Confirmation Modal using Modal.jsx */}
      <Modal
        isOpen={!!deleteConfirm}
        onClose={() => setDeleteConfirm(null)}
        title="Delete Sprint"
      >
        <p className="text-text-light dark:text-text-dark text-center">
          Are you sure you want to delete this sprint? This will also delete all tasks within it. This action cannot be undone.
        </p>
        <div className="flex justify-end gap-3 mt-4">
          <button
            onClick={() => setDeleteConfirm(null)}
            className="px-5 py-2 rounded-lg bg-navbar-light/30 dark:bg-navbar-dark/80  border-[1px] border-border-light dark:border-border-dark
                        text-black dark:text-white hover:bg-navbar-light/50 dark:hover:bg-navbar-dark
                        transition-all duration-200 font-medium 
                        hover:border-black dark:hover:border-white"
          >
            Cancel
          </button>
          <button
            onClick={() => handleDeleteSprint(deleteConfirm)}
            className="px-5 py-2 rounded-lg bg-red-500 dark:bg-red-600 text-white font-bold shadow-md hover:shadow-lg transition-all duration-200 hover:bg-red-600 dark:hover:bg-red-700 transform hover:scale-[1.02]"
          >
            Delete
          </button>
        </div>
      </Modal>
    </div>
  );
};

export default Sprints;
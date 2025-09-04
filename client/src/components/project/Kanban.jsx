import React, { useState, useEffect } from "react";
import API from "../../api/API";
import Modal from "../common/Modal";
import {
  DragDropContext,
  Droppable,
  Draggable,
} from "@hello-pangea/dnd";

const Kanban = ({ projectId, selectedSprint }) => {
  const [tasks, setTasks] = useState([]);
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [editTitle, setEditTitle] = useState("");
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  // Fetch tasks whenever selectedSprint changes
  useEffect(() => {
    const fetchTasks = async () => {
      if (!projectId || !selectedSprint) return;

      setIsLoading(true);
      try {
        const res = await API.get(
          `/api/projects/${projectId}/sprints/${selectedSprint._id}/tasks`
        );
        setTasks(res.data);
      } catch (err) {
        console.error("Error fetching tasks:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTasks();
  }, [projectId, selectedSprint]);

  const handleAddTask = async () => {
    if (!newTaskTitle.trim() || !selectedSprint) return;

    try {
      const res = await API.post(
        `/api/projects/${projectId}/sprints/${selectedSprint._id}/tasks`,
        { title: newTaskTitle }
      );
      setTasks(res.data);
      setNewTaskTitle("");
    } catch (err) {
      console.error("Error adding task:", err);
    }
  };

  const toggleTask = async (taskId) => {
    try {
      const res = await API.patch(
        `/api/projects/${projectId}/sprints/${selectedSprint._id}/tasks/${taskId}/toggle`
      );
      setTasks((prev) =>
        prev.map((t) => (t._id === taskId ? res.data : t))
      );
    } catch (err) {
      console.error("Error toggling task:", err);
    }
  };

  const handleDoubleClick = (task) => {
    setEditingTask(task._id);
    setEditTitle(task.title);
  };

  const handleEditTask = async (taskId) => {
    if (!editTitle.trim()) return;

    try {
      const res = await API.patch(
        `/api/projects/${projectId}/sprints/${selectedSprint._id}/tasks/${taskId}`,
        { title: editTitle }
      );
      setTasks((prev) =>
        prev.map((t) => (t._id === taskId ? res.data : t))
      );
      setEditingTask(null);
      setEditTitle("");
    } catch (err) {
      console.error("Error editing task:", err);
    }
  };

  const handleDeleteTask = async (taskId) => {
    try {
      await API.delete(
        `/api/projects/${projectId}/sprints/${selectedSprint._id}/tasks/${taskId}`
      );
      setTasks((prev) => prev.filter((t) => t._id !== taskId));
      setDeleteConfirm(null);
    } catch (err) {
      console.error("Error deleting task:", err);
    }
  };

  const cancelEdit = () => {
    setEditingTask(null);
    setEditTitle("");
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleAddTask();
    }
  };

  const handleEditKeyPress = (e, taskId) => {
    if (e.key === "Enter") {
      handleEditTask(taskId);
    } else if (e.key === "Escape") {
      cancelEdit();
    }
  };

  // --- Drag and Drop ---
  const reorder = (list, startIndex, endIndex) => {
    const result = Array.from(list);
    const [removed] = result.splice(startIndex, 1);
    result.splice(endIndex, 0, removed);
    return result;
  };

  const handleDragEnd = async (result) => {
    if (!result.destination) return;
    if (result.destination.index === result.source.index) return;

    const newTasks = reorder(
      tasks,
      result.source.index,
      result.destination.index
    );

    setTasks(newTasks);

    try {
      // Call API to persist order
      await API.changeTaskOrder(
        projectId,
        selectedSprint._id,
        newTasks.map((t) => t._id)
      );
    } catch (err) {
      console.error("Error saving task order:", err);
    }
  };

  return (
    <div className="flex-1 bg-primary-light dark:bg-primary-dark h-[350px] rounded-md shadow-lg overflow-hidden flex flex-col">
      {/* Header */}
      <div className="bg-black bg-opacity-40 h-[40px] text-white text-center text-xl font-jaro flex items-center justify-center rounded-t-md relative border-b-2 border-black">
        <span className="drop-shadow-md">Sprint Tasks</span>
      </div>

      {/* Task List */}
      <div className="flex-1 p-2 overflow-y-auto scrollbar-thin scrollbar-thumb-rounded-lg dark:scrollbar-thumb-rounded-lg-dark">
        {isLoading ? (
          <div className="flex justify-center items-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent"></div>
          </div>
        ) : tasks.length === 0 ? (
          <div className="text-center py-8 text-text-light dark:text-text-dark/70">
            <div className="text-4xl mb-2">📋</div>
            <p>No tasks yet</p>
            <p className="text-sm mt-1">Add your first task below</p>
          </div>
        ) : (
          <DragDropContext onDragEnd={handleDragEnd}>
            <Droppable droppableId="taskList">
              {(provided) => (
                <div
                  className="space-y-2"
                  {...provided.droppableProps}
                  ref={provided.innerRef}
                >
                  {tasks.map((task, index) => (
                    <Draggable
                      key={task._id}
                      draggableId={task._id}
                      index={index}
                    >
                      {(provided, snapshot) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          className={`flex items-center justify-between p-2 rounded-xl shadow-sm transition-all duration-200 ease-in-out group
                            ${
                              task.completed
                                ? "bg-white/50 dark:bg-black/75 "
                                : "bg-white/75 dark:bg-black/25 text-text-dark hover:shadow-md"
                            }
                            ${snapshot.isDragging ? "opacity-70 scale-[1.02] shadow-lg" : ""}
                          `}
                          style={{
                            ...provided.draggableProps.style,
                            transition: snapshot.isDragging
                              ? "transform 0.2s ease"
                              : "transform 0.25s ease, opacity 0.25s ease",
                          }}
                        >
                          <div className="flex items-center space-x-3 flex-1">
                            <button
                              onClick={() => toggleTask(task._id)}
                              className={`flex-shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors duration-200
                                ${
                                  task.completed
                                    ? "border-secondary-dark bg-secondary-dark/80 dark:border-accent dark:bg-accent/20"
                                    : "border-secondary-light/50 dark:border-navbar-dark group-hover:border-secondary-dark dark:group-hover:border-accent"
                                }`}
                            >
                              {task.completed && (
                                <svg
                                  className="w-3 h-3 text-accent"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="3"
                                    d="M5 13l4 4L19 7"
                                  ></path>
                                </svg>
                              )}
                            </button>

                            {editingTask === task._id ? (
                              <input
                                type="text"
                                value={editTitle}
                                onChange={(e) => setEditTitle(e.target.value)}
                                onKeyPress={(e) =>
                                  handleEditKeyPress(e, task._id)
                                }
                                onBlur={() => handleEditTask(task._id)}
                                className="flex-1 px-0 py-0 bg-transparent border-none focus:outline-none focus:ring-0 text-inherit font-inherit"
                                autoFocus
                              />
                            ) : (
                              <span
                                className={`flex-1 cursor-pointer ${
                                  task.completed ? "line-through" : ""
                                }`}
                                onDoubleClick={() => handleDoubleClick(task)}
                                title="Double-click to edit"
                              >
                                {task.title}
                              </span>
                            )}
                          </div>

                          {editingTask !== task._id && (
                            <button
                              onClick={() => setDeleteConfirm(task._id)}
                              className="opacity-0 group-hover:opacity-100 text-red-500 hover:text-red-700 p-1 transition-opacity duration-200"
                              title="Delete task"
                            >
                              <svg
                                className="w-4 h-4"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
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
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>
        )}
      </div>

      {/* Add Task Form */}
      <div className="flex gap-2 items-center p-2 bg-black/20 border-t-2 border-t-black dark:border-t-black">
        <input
          type="text"
          value={newTaskTitle}
          onChange={(e) => setNewTaskTitle(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Enter a new task..."
          className="flex-1 min-w-0 px-2 py-1 rounded-xl border-2 border-navbar-light/30 dark:border-navbar-dark/30
                    bg-ui-light dark:bg-black/50 text-text-light dark:text-text-dark 
                    focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-transparent transition-all"
          disabled={!selectedSprint}
        />
        <button
          onClick={handleAddTask}
          disabled={!selectedSprint || !newTaskTitle.trim()}
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
      <Modal
        isOpen={!!deleteConfirm}
        onClose={() => setDeleteConfirm(null)}
        title="Delete Task"
      >
        <p className="text-text-light dark:text-text-dark text-center">
          Are you sure you want to delete this task? This action cannot be undone.
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
            onClick={() => handleDeleteTask(deleteConfirm)}
            className="px-5 py-2 rounded-lg bg-red-500 dark:bg-red-600 text-white
                      font-bold shadow-md hover:shadow-lg
                      transition-all duration-200
                      hover:bg-red-600 dark:hover:bg-red-700
                      transform hover:scale-[1.02]"
          >
            Delete
          </button>
        </div>
      </Modal>
    </div>
  );
};

export default Kanban;

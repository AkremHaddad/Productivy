import React, { useState, useEffect, useRef } from "react";
import API from "../../api/API";
import { changeTaskOrder } from "../../api/project";
import Modal from "../common/Modal";
import {
  DragDropContext,
  Droppable,
  Draggable,
} from "@hello-pangea/dnd";
import LoadingSpinner from "../common/LoadingSpinner";

const Kanban = ({ projectId, selectedSprint }) => {
  const [tasks, setTasks] = useState([]);
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [editTitle, setEditTitle] = useState("");
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [isDragging, setIsDragging] = useState(false);

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

    const tempId = `temp_${Date.now()}`;
    const tempTask = { _id: tempId, title: newTaskTitle, completed: false };
    const previousTasks = [...tasks];
    setTasks([...tasks, tempTask]);
    setNewTaskTitle("");

    try {
      const res = await API.post(
        `/api/projects/${projectId}/sprints/${selectedSprint._id}/tasks`,
        { title: newTaskTitle }
      );
      setTasks(res.data);
    } catch (err) {
      console.error("Error adding task:", err);
      setTasks(previousTasks);
    }
  };

  const toggleTask = async (taskId) => {
    const taskIndex = tasks.findIndex((t) => t._id === taskId);
    if (taskIndex === -1) return;

    const previousTasks = [...tasks];
    const updatedTasks = [...tasks];
    updatedTasks[taskIndex] = {
      ...updatedTasks[taskIndex],
      completed: !updatedTasks[taskIndex].completed,
    };
    setTasks(updatedTasks);

    try {
      const res = await API.patch(
        `/api/projects/${projectId}/sprints/${selectedSprint._id}/tasks/${taskId}/toggle`
      );
      setTasks((prev) =>
        prev.map((t) => (t._id === taskId ? res.data : t))
      );
    } catch (err) {
      console.error("Error toggling task:", err);
      setTasks(previousTasks);
    }
  };

  const handleDoubleClick = (task) => {
    setEditingTask(task._id);
    setEditTitle(task.title);
  };

  const handleEditTask = async (taskId) => {
    if (!editTitle.trim()) return;

    const taskIndex = tasks.findIndex((t) => t._id === taskId);
    if (taskIndex === -1) return;

    const previousTitle = tasks[taskIndex].title;
    setTasks((prev) =>
      prev.map((t) =>
        t._id === taskId ? { ...t, title: editTitle } : t
      )
    );
    setEditingTask(null);
    setEditTitle("");

    try {
      const res = await API.patch(
        `/api/projects/${projectId}/sprints/${selectedSprint._id}/tasks/${taskId}`,
        { title: editTitle }
      );
      setTasks((prev) =>
        prev.map((t) => (t._id === taskId ? res.data : t))
      );
    } catch (err) {
      console.error("Error editing task:", err);
      setTasks((prev) =>
        prev.map((t) =>
          t._id === taskId ? { ...t, title: previousTitle } : t
        )
      );
    }
  };

  const handleDeleteTask = async (taskId) => {
    const taskIndex = tasks.findIndex((t) => t._id === taskId);
    if (taskIndex === -1) return;

    const previousTasks = [...tasks];
    const updatedTasks = tasks.filter((t) => t._id !== taskId);
    setTasks(updatedTasks);
    setDeleteConfirm(null);

    try {
      await API.delete(
        `/api/projects/${projectId}/sprints/${selectedSprint._id}/tasks/${taskId}`
      );
    } catch (err) {
      console.error("Error deleting task:", err);
      setTasks(previousTasks);
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

  const handleDragStart = () => {
    setIsDragging(true);
  };

  const handleDragEnd = async (result) => {
    setIsDragging(false);

    if (!result.destination) return;

    // If dropped in delete zone
    if (result.destination.droppableId === "deleteZone") {
      const taskId = tasks[result.source.index]._id;
      handleDeleteTask(taskId); // Instant delete without confirm
      return;
    }

    // Normal reordering
    if (result.destination.index === result.source.index) return;

    const previousTasks = [...tasks];
    const newTasks = reorder(
      tasks,
      result.source.index,
      result.destination.index
    );

    setTasks(newTasks);

    try {
      await changeTaskOrder(
        projectId,
        selectedSprint._id,
        newTasks.map((t) => t._id)
      );
    } catch (err) {
      console.error("Error saving task order:", err);
      setTasks(previousTasks);
    }
  };

  return (
    <div className="flex-1 bg-ui-light dark:bg-ui-dark h-[460px] rounded-md shadow-lg overflow-hidden flex flex-col border-[1px] border-border-light dark:border-border-dark">
      {/* Header */}
      <div className="bg-header-light dark:bg-header-dark h-[40px] text-black dark:text-white text-center text-lg font-jaro flex border-b-[1px] border-border-light dark:border-border-dark
                       items-center justify-center rounded-t-md relative">
        <span className="drop-shadow-md">Sprint Tasks</span>
      </div>

      {/* Task List */}
      <DragDropContext onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
        <Droppable droppableId="taskList">
          {(provided) => (
            <div
              className="flex-1 p-2 overflow-y-auto scrollbar-thin scrollbar-thumb-rounded-lg dark:scrollbar-thumb-rounded-lg-dark space-y-2"
              {...provided.droppableProps}
              ref={provided.innerRef}
            >
              {isLoading ? (
                <div className="flex justify-center items-center h-32">
                  <LoadingSpinner />
                </div>
              ) : tasks.length === 0 ? (
                <div className="text-center py-8 text-text-light dark:text-text-dark/70">
                  <div className="text-4xl mb-2">📋</div>
                  <p>No tasks yet</p>
                  <p className="text-sm mt-1">Add your first task below</p>
                </div>
              ) : (
                tasks.map((task, index) => (
                  <Draggable key={task._id} draggableId={task._id} index={index}>
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                        className={`flex items-center justify-between text-sm p-2 rounded-xl shadow-sm transition-all duration-200 ease-in-out group  border border-border-light dark:border-border-dark
                          ${ 
                            task.completed
                              ? "bg-white dark:bg-background-dark text-gray-500"
                              : "bg-white dark:bg-background-dark dark:text-text-dark hover:shadow-md"
                          }
                          ${snapshot.isDragging ? "opacity-70 scale-[1.02] shadow-lg" : ""}
                        `}
                      >
                        <div className="flex items-center space-x-3 flex-1">
                          <button
                            onClick={() => toggleTask(task._id)}
                            className={`flex-shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors duration-200
                              ${
                                task.completed
  ? "border-black bg-black/10 dark:border-white dark:bg-white/10"
  : "border-black/30 dark:border-white/30 group-hover:border-black dark:group-hover:border-white"

                              }`}
                          >
                            {task.completed && (
                              <svg
                                className="w-3 h-3 text-black dark:text-white"
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
                      </div>
                    )}
                  </Draggable>
                ))
              )}
              {provided.placeholder}
            </div>
          )}
        </Droppable>

        {/* Delete Zone (using input row as drop target) */}
        <Droppable droppableId="deleteZone">
          {(provided, snapshot) => (
            <div
              ref={provided.innerRef}
              {...provided.droppableProps}
              className={`min-h-[51.2px] max-h-[51.2px] transition-all duration-300 ease-in-out relative
                ${
                  snapshot.isDraggingOver || isDragging
                    ? "bg-gradient-to-r from-red-500/70 to-red-600/70 text-white shadow-lg border-red-400"
                    : "bg-black/20 dark:bg-black/20"
                }`}
            >
              {snapshot.isDraggingOver || isDragging ? (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="flex items-center space-x-3">
                    {/* Trash Icon */}
                    <svg
                      className="w-6 h-6 text-white animate-bounce"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                      />
                    </svg>
                    <div className="text-white text-lg font-bold tracking-wide drop-shadow-lg whitespace-nowrap">
                      Drop here to delete
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex gap-2 items-center p-2 bg-header-light dark:bg-header-dark border-t-[1px] border-border-light dark:border-border-dark">
                  <input
                    type="text"
                    value={newTaskTitle}
                    onChange={(e) => setNewTaskTitle(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Enter a new task..."
                    className="flex-1 min-w-0 px-2 py-1 rounded-xl border-[1px] border-border-light dark:border-border-dark
                               bg-ui-light dark:bg-ui-dark text-text-light dark:text-text-dark
                              focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white focus:border-transparent transition-all"
                    disabled={!selectedSprint}
                  />
                  <button
                    onClick={handleAddTask}
                    disabled={!selectedSprint || !newTaskTitle.trim()}
                    className="shrink-0 w-8 h-8 bg-white dark:bg-black  text-black dark:text-white rounded-xl
                              hover:opacity-70 disabled:opacity-50 disabled:cursor-not-allowed
                              transition-all shadow-sm hover:shadow-lg flex items-center justify-center
                              border-[1px] border-border-light dark:border-border-dark"
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
                      />
                    </svg>
                  </button>
                </div>
              )}
              <div style={{ display: "none" }}>{provided.placeholder}</div>
            </div>
          )}
        </Droppable>
      </DragDropContext>

      {/* Delete Confirmation Modal - Removed since delete is now instant on drop */}
    </div>
  );
};

export default Kanban;
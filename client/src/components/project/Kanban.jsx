import React, { useState } from "react";
import API from "../../api/API";
import { changeTaskOrder } from "../../api/project";
import Modal from "../common/Modal";
import {
  DragDropContext,
  Droppable,
  Draggable,
} from "@hello-pangea/dnd";

// Tasks live in Project.jsx's shared `sprints` state (see the sync-bug fix
// note there) - this component reads the selected sprint's tasks directly
// as a prop and writes changes back up via onTasksChange, instead of
// fetching/holding its own separate copy that could go stale.
const Kanban = ({ projectId, selectedSprint, onTasksChange }) => {
  const tasks = selectedSprint?.tasks || [];
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [editingTask, setEditingTask] = useState(null);
  const [editTitle, setEditTitle] = useState("");
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [openNoteId, setOpenNoteId] = useState(null);
  const [noteDraft, setNoteDraft] = useState("");

  const handleAddTask = async () => {
    if (!newTaskTitle.trim() || !selectedSprint) return;

    const tempId = `temp_${Date.now()}`;
    const tempTask = { _id: tempId, title: newTaskTitle, completed: false };
    const previousTasks = tasks;
    onTasksChange([...tasks, tempTask]);
    setNewTaskTitle("");

    try {
      const res = await API.post(
        `/api/projects/${projectId}/sprints/${selectedSprint._id}/tasks`,
        { title: newTaskTitle }
      );
      onTasksChange(res.data);
    } catch (err) {
      console.error("Error adding task:", err);
      onTasksChange(previousTasks);
    }
  };

  const toggleTask = async (taskId) => {
    const taskIndex = tasks.findIndex((t) => t._id === taskId);
    if (taskIndex === -1) return;

    const previousTasks = tasks;
    const updatedTasks = [...tasks];
    updatedTasks[taskIndex] = {
      ...updatedTasks[taskIndex],
      completed: !updatedTasks[taskIndex].completed,
    };
    onTasksChange(updatedTasks);

    try {
      const res = await API.patch(
        `/api/projects/${projectId}/sprints/${selectedSprint._id}/tasks/${taskId}/toggle`
      );
      onTasksChange(updatedTasks.map((t) => (t._id === taskId ? res.data : t)));
    } catch (err) {
      console.error("Error toggling task:", err);
      onTasksChange(previousTasks);
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

    const previousTasks = tasks;
    const optimisticTasks = tasks.map((t) =>
      t._id === taskId ? { ...t, title: editTitle } : t
    );
    onTasksChange(optimisticTasks);
    setEditingTask(null);
    setEditTitle("");

    try {
      const res = await API.patch(
        `/api/projects/${projectId}/sprints/${selectedSprint._id}/tasks/${taskId}`,
        { title: editTitle }
      );
      onTasksChange(optimisticTasks.map((t) => (t._id === taskId ? res.data : t)));
    } catch (err) {
      console.error("Error editing task:", err);
      onTasksChange(previousTasks);
    }
  };

  const handleDeleteTask = async (taskId) => {
    const taskIndex = tasks.findIndex((t) => t._id === taskId);
    if (taskIndex === -1) return;

    const previousTasks = tasks;
    const updatedTasks = tasks.filter((t) => t._id !== taskId);
    onTasksChange(updatedTasks);
    setDeleteConfirm(null);

    try {
      await API.delete(
        `/api/projects/${projectId}/sprints/${selectedSprint._id}/tasks/${taskId}`
      );
    } catch (err) {
      console.error("Error deleting task:", err);
      onTasksChange(previousTasks);
    }
  };

  const cancelEdit = () => {
    setEditingTask(null);
    setEditTitle("");
  };

  const saveNote = async (taskId) => {
    const taskIndex = tasks.findIndex((t) => t._id === taskId);
    if (taskIndex === -1) return;

    const previousTasks = tasks;
    const optimisticTasks = tasks.map((t) => (t._id === taskId ? { ...t, note: noteDraft } : t));
    onTasksChange(optimisticTasks);
    setOpenNoteId(null);

    try {
      const res = await API.patch(
        `/api/projects/${projectId}/sprints/${selectedSprint._id}/tasks/${taskId}`,
        { note: noteDraft }
      );
      onTasksChange(optimisticTasks.map((t) => (t._id === taskId ? res.data : t)));
    } catch (err) {
      console.error("Error saving note:", err);
      onTasksChange(previousTasks);
    }
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

    const previousTasks = tasks;
    const newTasks = reorder(
      tasks,
      result.source.index,
      result.destination.index
    );

    onTasksChange(newTasks);

    try {
      await changeTaskOrder(
        projectId,
        selectedSprint._id,
        newTasks.map((t) => t._id)
      );
    } catch (err) {
      console.error("Error saving task order:", err);
      onTasksChange(previousTasks);
    }
  };

  return (
    <div className="bg-ui-light dark:bg-ui-dark rounded-2xl border border-border-light dark:border-border-dark p-4 flex flex-col gap-3">
      {/* Header */}
      <div className="font-mono text-[11px] font-semibold tracking-widest uppercase text-secondary-light dark:text-secondary-dark">
        Sprint tasks
      </div>

      {/* Task List */}
      <DragDropContext onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
        <Droppable droppableId="taskList">
          {(provided) => (
            <div
              className="max-h-[220px] overflow-y-auto scrollbar-thin scrollbar-thumb-rounded-lg dark:scrollbar-thumb-rounded-lg-dark space-y-2"
              {...provided.droppableProps}
              ref={provided.innerRef}
            >
              {tasks.length === 0 ? (
                <div className="text-center py-6 text-text-light dark:text-text-dark/70">
                  <div className="text-3xl mb-2">📋</div>
                  <p className="text-sm">No tasks yet</p>
                  <p className="text-xs mt-1">Add your first task below</p>
                </div>
              ) : (
                tasks.map((task, index) => (
                  <Draggable key={task._id} draggableId={task._id} index={index}>
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                        className={`flex flex-col text-sm p-2 rounded-xl transition-all duration-200 ease-in-out group border-[1px] border-border-light dark:border-border-dark
                          ${
                            task.completed
                              ? "bg-header-light dark:bg-header-dark text-secondary-light dark:text-secondary-dark"
                              : "bg-header-light dark:bg-header-dark text-text-light dark:text-text-dark hover:shadow-md"
                          }
                          ${snapshot.isDragging ? "opacity-70 scale-[1.02] shadow-lg" : ""}
                        `}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3 flex-1 min-w-0">
                            <button
                              onClick={() => toggleTask(task._id)}
                              className={`flex-shrink-0 w-5 h-5 rounded-full border-[1.5px] flex items-center justify-center transition-colors duration-200
                                ${
                                  task.completed
                                    ? "bg-accent-light dark:bg-accent border-accent-light dark:border-accent"
                                    : "border-border-light dark:border-border-dark group-hover:border-accent-light dark:group-hover:border-accent"
                                }`}
                            >
                              {task.completed && (
                                <svg
                                  className="w-3 h-3 text-black"
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
                                maxLength={200}
                                className="flex-1 px-0 py-0 bg-transparent border-none focus:outline-none focus:ring-0 text-inherit font-inherit"
                                autoFocus
                              />
                            ) : (
                              <span
                                className={`flex-1 truncate cursor-pointer ${
                                  task.completed ? "line-through" : ""
                                }`}
                                onDoubleClick={() => handleDoubleClick(task)}
                                title="Double-click to edit"
                              >
                                {task.title}
                              </span>
                            )}
                          </div>

                          {!task.note && openNoteId !== task._id && (
                            <button
                              onClick={() => { setOpenNoteId(task._id); setNoteDraft(""); }}
                              className="opacity-0 group-hover:opacity-100 flex-shrink-0 text-[10px] font-semibold text-secondary-light dark:text-secondary-dark hover:text-accent-light dark:hover:text-accent transition ml-2"
                            >
                              + Note
                            </button>
                          )}
                        </div>

                        {(task.note || openNoteId === task._id) && (
                          <div className="mt-1.5 ml-8">
                            {openNoteId === task._id ? (
                              <textarea
                                autoFocus
                                value={noteDraft}
                                onChange={(e) => setNoteDraft(e.target.value)}
                                onBlur={() => saveNote(task._id)}
                                rows={2}
                                maxLength={500}
                                placeholder="Add a note..."
                                className="w-full text-xs italic px-2 py-1.5 rounded-lg border-[1px] border-border-light dark:border-border-dark bg-ui-light dark:bg-ui-dark text-secondary-light dark:text-secondary-dark focus:outline-none resize-y"
                              />
                            ) : (
                              <p
                                onClick={() => { setOpenNoteId(task._id); setNoteDraft(task.note || ""); }}
                                className="text-xs italic text-secondary-light dark:text-secondary-dark cursor-text whitespace-pre-line"
                              >
                                {task.note}
                              </p>
                            )}
                          </div>
                        )}
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
                <div className="flex gap-2 items-center p-2">
                  <input
                    type="text"
                    value={newTaskTitle}
                    onChange={(e) => setNewTaskTitle(e.target.value)}
                    onKeyPress={handleKeyPress}
                    maxLength={200}
                    placeholder="Enter a new task..."
                    className="flex-1 min-w-0 px-2.5 py-1.5 text-sm rounded-lg border-[1px] border-border-light dark:border-border-dark
                               bg-background-light dark:bg-background-dark text-text-light dark:text-text-dark
                              focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white focus:border-transparent transition-all"
                    disabled={!selectedSprint}
                  />
                  <button
                    onClick={handleAddTask}
                    disabled={!selectedSprint || !newTaskTitle.trim()}
                    className="shrink-0 w-8 h-8 bg-header-light dark:bg-header-dark text-black dark:text-white rounded-lg
                              hover:opacity-70 disabled:opacity-50 disabled:cursor-not-allowed
                              transition-all flex items-center justify-center
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
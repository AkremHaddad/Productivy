import React, { useState, useEffect } from "react";
import API from "../../api/API";

const Kanban = ({ projectId, selectedSprint }) => {
  const [tasks, setTasks] = useState([]);
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [isLoading, setIsLoading] = useState(false);

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

  // Handle Enter key press for adding tasks
  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleAddTask();
    }
  };

  return (
    <div className="flex-1 bg-primary-light dark:bg-primary-dark h-[350px] rounded-md shadow-lg overflow-hidden flex flex-col">
      {/* Header */}
      <div className="bg-black bg-opacity-30 h-[40px] text-white text-center text-xl font-jaro flex items-center justify-center rounded-t-md relative">
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
          <div className="space-y-2">
            {tasks.map((task) => (
              <div
                key={task._id}
                className={`flex items-center justify-between p-2 rounded-xl shadow-sm transition-all duration-200 group text-text-light dark:text-text-dark
                  ${
                    task.completed
                      ? "bg-white/50 dark:bg-black/75 "
                      : "bg-white/75 dark:bg-black/25 text-text-dark hover:shadow-md"
                  }`}
              >
                <div className="flex items-center space-x-3">
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
                      <svg className="w-3 h-3 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path>
                      </svg>
                    )}
                  </button>
                  <span className={`flex-1 ${task.completed ? "line-through" : ""}`}>
                    {task.title}
                  </span>
                </div>
                
              </div>
            ))}
          </div>
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
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
    </svg>
  </button>
</div>

    </div>
  );
};

export default Kanban;
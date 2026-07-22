import React, { useEffect, useState } from "react";
import { useParams } from "react-router";
import Navbar from "../allPages/Navbar";
import Footer from "../allPages/Footer";
import Pomodoro from "../project/Pomodoro";
import Time from "../project/Time";
import Sprints from "../project/Sprints";
import Kanban from "../project/Kanban";
import Tabs from "../project/Tabs";
import Board from "../project/Board";
import { getProject } from "../../api/project";
import LoadingSpinner from "../common/LoadingSpinner";

const Project = () => {
  const { id } = useParams();
  const [project, setProject] = useState(null);
  // Sprints (with their tasks) live here, not in Sprints.jsx/Kanban.jsx
  // separately - both used to independently fetch/hold their own copy,
  // so a task toggled in Kanban never reached Sprints' completion dial
  // until a full reload. Single shared source of truth fixes that: any
  // change updates this once, both children re-render from the same data.
  const [sprints, setSprints] = useState([]);
  const [selectedSprintId, setSelectedSprintId] = useState(null);
  const [showTools, setShowTools] = useState(true);

  // Fetch project
  useEffect(() => {
    const fetchProject = async () => {
      try {
        const data = await getProject(id);
        setProject(data);
        setSprints(data.sprints || []);
        if (data.sprints?.length > 0) setSelectedSprintId(data.sprints[0]._id);
      } catch (err) {
        console.error("Failed to load project", err);
      }
    };
    fetchProject();
  }, [id]);

  const selectedSprint = sprints.find((s) => s._id === selectedSprintId) || null;

  const updateSprintTasks = (sprintId, newTasks) => {
    setSprints((prev) => prev.map((s) => (s._id === sprintId ? { ...s, tasks: newTasks } : s)));
  };

  if (!project) return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark flex items-center justify-center p-4">
      <div className="text-center space-y-6">
        {/* Main Spinner - matches your LoadingSpinner component style */}
        <div className="flex justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 dark:border-white border-black"></div>
        </div>

        {/* Loading Text */}
        <div className="space-y-2">
          <h3 className="text-lg font-medium text-gray-800 dark:text-white">
            Loading Project
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Please wait while we fetch your project details...
          </p>
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex flex-col min-h-screen overflow-x-hidden bg-background-light dark:bg-background-dark">
      <Navbar />

      {/* Mobile-only: md+ always shows sidebar and board side by side in
          the grid below, so there's nothing left to toggle there. */}
      <div className="md:hidden">
        <Tabs showTools={showTools} setShowTools={setShowTools} />
      </div>

      <div className="flex-1 p-5 min-w-0">
        <div className="bg-ui-light dark:bg-ui-dark rounded-2xl border border-border-light dark:border-border-dark shadow-lg">
          <div className="p-4 md:p-6 grid grid-cols-1 md:grid-cols-[340px_1fr] gap-5 items-start">
            {/* Below md, showTools hard-switches between this sidebar and
                the board (one full-width pane at a time) instead of
                squeezing both into a too-narrow viewport. At md+ both
                always show, side by side in the grid. */}
            <div className={`flex-col gap-4 min-w-0 ${showTools ? "flex" : "hidden"} md:flex`}>
              <Pomodoro />
              <Time />
              <Sprints
                projectId={project._id}
                sprints={sprints}
                onSprintsChange={setSprints}
                selectedSprintId={selectedSprintId}
                onSprintSelect={(s) => setSelectedSprintId(s?._id ?? null)}
              />
              <Kanban
                projectId={project._id}
                selectedSprint={selectedSprint}
                onTasksChange={(newTasks) => updateSprintTasks(selectedSprintId, newTasks)}
              />
            </div>

            <div className={`min-w-0 ${showTools ? "hidden" : "flex"} md:flex`}>
              <Board projectId={project._id} boards={project.boards} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Project;

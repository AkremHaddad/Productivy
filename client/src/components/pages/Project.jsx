import React, { useEffect, useState } from "react";
import { useParams } from "react-router";
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
  // "all" (sprints+tasks+board), "sprints" (sprints+tasks only, side by
  // side), or "board" (board only) - lets you focus on just what you're
  // doing instead of always seeing all three areas at once.
  const [viewMode, setViewMode] = useState("all");

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
        <div className="flex justify-center">
          <LoadingSpinner />
        </div>
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

  const sprintsAndTasks = (
    <>
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
    </>
  );

  return (
    // md:h-full + overflow-hidden: fills exactly what's left below the
    // navbar (Layout in App.jsx already constrains that to the viewport),
    // no page-level scroll on desktop - overflow is handled inside (the
    // board's own column area, or the sidebar's overflow-y-auto below).
    // Only gated at md: - mobile keeps its natural stacking/scrolling.
    <div className="flex flex-col md:h-full overflow-x-hidden md:overflow-hidden bg-background-light dark:bg-background-dark">
      <Tabs viewMode={viewMode} setViewMode={setViewMode} />

      <div className="flex-1 p-5 min-w-0 md:min-h-0 md:flex md:flex-col">
        <div className="bg-ui-light dark:bg-ui-dark rounded-2xl border border-border-light dark:border-border-dark shadow-lg md:flex-1 md:min-h-0 md:flex md:flex-col md:overflow-hidden">
          <div className="p-4 md:p-6 md:flex-1 md:min-h-0 md:overflow-hidden">
            {viewMode === "board" ? (
              <div className="md:h-full min-w-0 flex">
                <Board projectId={project._id} boards={project.boards} />
              </div>
            ) : viewMode === "sprints" ? (
              // Sprints at left, tasks (with notes) at right - side by side
              // since the board isn't competing for width in this mode.
              <div className="flex flex-col md:flex-row gap-4 min-w-0">
                <div className="flex-1 min-w-0">
                  <Sprints
                    projectId={project._id}
                    sprints={sprints}
                    onSprintsChange={setSprints}
                    selectedSprintId={selectedSprintId}
                    onSprintSelect={(s) => setSelectedSprintId(s?._id ?? null)}
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <Kanban
                    projectId={project._id}
                    selectedSprint={selectedSprint}
                    onTasksChange={(newTasks) => updateSprintTasks(selectedSprintId, newTasks)}
                  />
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-[280px_1fr] gap-5 md:h-full min-w-0">
                <div className="flex flex-col gap-4 min-w-0 md:h-full md:overflow-y-auto">
                  {sprintsAndTasks}
                </div>
                <div className="min-w-0 md:h-full flex">
                  <Board projectId={project._id} boards={project.boards} />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Project;

import React, { useEffect, useState } from "react";
import { useParams } from "react-router";
import Navbar from "../allPages/Navbar";
import Footer from "../allPages/Footer";
import Pomodoro from "../project/Pomodoro";
import Status from "../project/Status";
import Time from "../project/Time";
import Sprints from "../project/Sprints";
import Kanban from "../project/Kanban";
import Tabs from "../project/Tabs";
import Board from "../project/Board";
import { getProject } from "../../api/project";
import API from "../../api/API"; // ✅ import API for fetching minutes
import LoadingSpinner from "../common/LoadingSpinner";

const Project = () => {
  const { id } = useParams();
  const [project, setProject] = useState(null);
  const [selectedSprint, setSelectedSprint] = useState(null);
  const [showTools, setShowTools] = useState(true);

  // ✅ shared state
  const [minutesWorked, setMinutesWorked] = useState(0);

  // Fetch project
  useEffect(() => {
    const fetchProject = async () => {
      try {
        const data = await getProject(id);
        setProject(data);
        if (data.sprints?.length > 0) setSelectedSprint(data.sprints[0]);
      } catch (err) {
        console.error("Failed to load project", err);
      }
    };
    fetchProject();
  }, [id]);

  // ✅ Fetch initial minutes worked
  useEffect(() => {
    const fetchMinutesWorked = async () => {
      try {
        const res = await API.get("/api/activity/today", { withCredentials: true });
        setMinutesWorked(res.data?.minutes || 0);
      } catch (err) {
        console.error("❌ Failed to fetch minutes worked:", err);
      }
    };

    fetchMinutesWorked();
  }, []);
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

      <Tabs showTools={showTools} setShowTools={setShowTools} />

      <div className="flex-1 flex  p-5 pb-0 gap-2.5">
        <div
          id="tools"
          className={`flex flex-col gap-2.5 overflow-hidden transition-all duration-500 ease-in-out
            ${showTools ? "max-w-[500px] opacity-100" : "max-w-0 opacity-0 mr-0"}
          `}
        >
          <div className="select-none flex flex-row bg-ui-light dark:bg-ui-dark rounded-md border border-border-light dark:border-border-dark">
            <Pomodoro />
            {/* ✅ Status updates minutesWorked; Time only displays */}
            <Status onMinutesUpdate={setMinutesWorked} />
            <Time minutesWorked={minutesWorked} />
          </div>

          <div className="flex flex-row gap-2.5">
            <Sprints
              projectId={project._id}
              selectedSprintId={selectedSprint?._id}
              onSprintSelect={(s) => setSelectedSprint(s)}
            />
            <Kanban projectId={project._id} selectedSprint={selectedSprint} />
          </div>
        </div>

        <Board projectId={project._id} boards={project.boards} />
      </div>
    </div>
  );
};

export default Project;

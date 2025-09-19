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

const Project = () => {
  const { id } = useParams();
  const [project, setProject] = useState(null);
  const [selectedSprint, setSelectedSprint] = useState(null);
  const [showTools, setShowTools] = useState(true);

  // ✅ new shared state
  const [minutesWorked, setMinutesWorked] = useState(0);

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

  if (!project) return <div className="text-center p-10">Loading...</div>;

  return (
    <div className="flex flex-col min-h-screen overflow-x-hidden">
      <Navbar />

      <Tabs showTools={showTools} setShowTools={setShowTools} />

      <div className="flex-1 flex bg-background-light dark:bg-black p-5 pb-0 gap-2.5">
        <div
          id="tools"
          className={`flex flex-col gap-2.5 overflow-hidden transition-all duration-500 ease-in-out
            ${showTools ? "max-w-[500px] opacity-100" : "max-w-0 opacity-0 mr-0"}
          `}
        >
          <div className="select-none flex flex-row bg-[#1F2937] dark:bg-[#131313] rounded-md border border-gray-400 dark:border-gray-700">
            <Pomodoro />
            {/* ✅ pass down state + updater */}
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

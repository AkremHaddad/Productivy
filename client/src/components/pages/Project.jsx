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
import ToolsFooter from "../project/ToolsFooter";
import Board from "../project/Board";
import { getProject } from "../../api/project";

const Project = () => {
  const { id } = useParams();
  const [project, setProject] = useState(null);
  const [selectedSprint, setSelectedSprint] = useState(null);

  useEffect(() => {
    const fetchProject = async () => {
      try {
        const data = await getProject(id);
        setProject(data);
        if (data.sprints?.length > 0) {
          setSelectedSprint(data.sprints[0]); // default first sprint
        }
      } catch (err) {
        console.error("Failed to load project", err);
      }
    };
    fetchProject();
  }, [id]);

  if (!project) {
    return <div className="text-center p-10">Loading...</div>;
  }

  return (
    <div className="flex flex-col min-h-screen overflow-x-hidden">
      <Navbar />
      <Tabs />
      <div className="flex-1 flex bg-background-light dark:bg-black p-5">
        <div className="flex flex-col gap-1.5 w-[500px]">
          <div className="flex flex-row gap-1.5">
            <Pomodoro />
            <Status />
            <Time />
          </div>
          <div className="flex flex-row gap-1.5">
            <Sprints
              projectId={project._id}
              selectedSprintId={selectedSprint?._id}
              onSprintSelect={(s) => setSelectedSprint(s)}
            />
            <Kanban
              projectId={project._id}
              selectedSprint={selectedSprint}
            />
          </div>
          <div className="flex flex-row gap-1.5">
            <ToolsFooter />
          </div>
        </div>
        <Board />
      </div>
    </div>
  );
};

export default Project;

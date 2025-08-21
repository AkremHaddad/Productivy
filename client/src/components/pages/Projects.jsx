import React, { useEffect, useState } from "react";
import Navbar from "../allPages/Navbar";
import Footer from "../allPages/Footer";
import { getProjects, createProject } from "../../api/project";
import { useNavigate } from "react-router";

const Projects = () => {
  const [projects, setProjects] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [newProjectName, setNewProjectName] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const data = await getProjects();
        setProjects(data);
      } catch (err) {
        console.error("Failed to load projects", err);
      }
    };
    fetchProjects();
  }, []);

  const handleCreate = async () => {
    if (!newProjectName.trim()) return;
    try {
      const project = await createProject(newProjectName);
      setProjects([project, ...projects]);
      setShowModal(false);
      setNewProjectName("");
      navigate(`/project/${project._id}`);
    } catch (err) {
      console.error("Failed to create project", err);
    }
  };

  return (
    <div className="flex flex-col min-h-screen overflow-x-hidden">
      <Navbar />
      <main className="flex-1 bg-background-light dark:bg-background-dark p-6">
        <h1 className="mt-4 text-3xl font-bold text-secondary-light dark:text-accent text-center">
          My projects
        </h1>

        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {/* Add Project button */}
          <div
            onClick={() => setShowModal(true)}
            className="cursor-pointer border-2 border-dashed border-gray-400 rounded-xl flex items-center justify-center h-40 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            + Add Project
          </div>

          {/* User Projects */}
          {projects.map((project) => (
            <div
              key={project._id}
              className="p-4 bg-white dark:bg-gray-900 shadow rounded-xl cursor-pointer hover:shadow-lg transition"
              onClick={() => navigate(`/project/${project._id}`)}
            >
              <h2 className="text-xl font-semibold">{project.name}</h2>
              <p className="text-sm text-gray-500">
                Created: {new Date(project.createdAt).toLocaleDateString()}
              </p>
            </div>
          ))}
        </div>

        {/* Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <div className="bg-white dark:bg-gray-900 p-6 rounded-xl shadow-xl w-96">
              <h2 className="text-lg font-bold mb-4">Create Project</h2>
              <input
                type="text"
                placeholder="Project name"
                value={newProjectName}
                onChange={(e) => setNewProjectName(e.target.value)}
                className="w-full p-2 border rounded-lg dark:bg-gray-800"
              />
              <div className="flex justify-end gap-2 mt-4">
                <button
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 bg-gray-300 rounded-lg dark:bg-gray-700"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreate}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg"
                >
                  Create
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
      <Footer className="mt-auto" />
    </div>
  );
};

export default Projects;

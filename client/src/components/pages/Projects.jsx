import React, { useEffect, useState } from "react";
import Navbar from "../allPages/Navbar";
import Footer from "../allPages/Footer";
import Modal from "../common/Modal";
import { getProjects, createProject, deleteProject } from "../../api/project";
import { useNavigate } from "react-router";
import LoadingSpinner from "../common/LoadingSpinner";

const Projects = () => {
  const [projects, setProjects] = useState([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState(null);
  const [newProjectName, setNewProjectName] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        setIsLoading(true);
        const data = await getProjects();
        setProjects(data);
      } catch (err) {
        console.error("Failed to load projects", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchProjects();
  }, []);

  const handleCreate = async () => {
    if (!newProjectName.trim()) return;
    try {
      const project = await createProject(newProjectName);
      setProjects([project, ...projects]);
      setShowCreateModal(false);
      setNewProjectName("");
      navigate(`/project/${project._id}`);
    } catch (err) {
      console.error("Failed to create project", err);
    }
  };

  const handleDelete = async () => {
    if (!projectToDelete) return;
    try {
      await deleteProject(projectToDelete._id);
      setProjects(projects.filter((p) => p._id !== projectToDelete._id));
      setShowDeleteModal(false);
      setProjectToDelete(null);
    } catch (err) {
      console.error("Failed to delete project", err);
    }
  };

  return (
    <div className="flex flex-col min-h-screen overflow-x-hidden bg-background-light dark:bg-background-dark transition-colors duration-300">
      <Navbar />
      <main className="flex-1 p-6 max-w-6xl mx-auto w-full">
        <div className="flex justify-between items-center mb-8 mt-4">
          <h1 className="text-4xl font-bold text-secondary-light dark:text-accent">
            My Projects
          </h1>
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-6 py-3 bg-secondary-light dark:bg-accent text-white dark:text-black rounded-lg font-medium hover:opacity-90 transition-opacity shadow-md flex items-center gap-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
            </svg>
            New Project
          </button>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <LoadingSpinner/>
          </div>
        ) : projects.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {projects.map((project) => (
              <div
                key={project._id}
                className="p-6 bg-white dark:bg-ui-dark shadow-md rounded-xl cursor-pointer hover:shadow-lg transition-all duration-300 border-[1px] border-border-light dark:border-border-dark group relative"
                onClick={() => navigate(`/project/${project._id}`)}
              >
                <div className="flex items-start justify-between mb-4">
                  <h2 className="text-xl font-semibold text-text-light dark:text-text-dark group-hover:text-secondary-light dark:group-hover:text-accent transition-colors line-clamp-1">
                    {project.name}
                  </h2>
                  <div className="flex items-center gap-2">
                    {/* Delete Button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setProjectToDelete(project);
                        setShowDeleteModal(true);
                      }}
                      className="text-gray-400 hover:text-red-500 transition-colors"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                    {/* Navigation Arrow */}
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400 group-hover:text-secondary-light dark:group-hover:text-accent transition-colors" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                  Created: {new Date(project.createdAt).toLocaleDateString()}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="mx-auto w-24 h-24 rounded-full bg-ui-light dark:bg-gray-800 flex items-center justify-center mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <h3 className="text-xl font-medium text-text-light dark:text-text-dark mb-2">No projects yet</h3>
            <p className="text-gray-500 dark:text-gray-400 mb-6">Get started by creating your first project</p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-5 py-2.5 bg-secondary-light dark:bg-accent text-white dark:text-black rounded-lg font-medium hover:opacity-90 transition-opacity inline-flex items-center gap-2"
            >
              Create Project
            </button>
          </div>
        )}

        {/* Create Project Modal */}
        <Modal isOpen={showCreateModal} onClose={() => setShowCreateModal(false)} title="Create New Project">
          <input
            type="text"
            placeholder="Enter project name"
            value={newProjectName}
            onChange={(e) => setNewProjectName(e.target.value)}
            className="w-full p-3 border border-gray-300 dark:border-gray-700 rounded-lg dark:bg-white/10 text-text-light dark:text-text-dark focus:ring-2 focus:ring-black dark:focus:ring-white outline-none mb-4"
            autoFocus
            onKeyDown={(e) => e.key === "Enter" && handleCreate()}
          />
          <div className="flex justify-end gap-3">
            <button
              onClick={() => setShowCreateModal(false)}
            className="px-5 py-2 rounded-lg bg-navbar-light/30 dark:bg-navbar-dark/80  border-[1px] border-border-light dark:border-border-dark
                        text-black dark:text-white hover:bg-navbar-light/50 dark:hover:bg-navbar-dark
                        transition-all duration-200 font-medium 
                        hover:border-black dark:hover:border-white"
            >
              Cancel
            </button>
            <button
              onClick={handleCreate}
              disabled={!newProjectName.trim()}
              className="px-4 py-2.5 bg-white dark:bg-white text-white dark:text-black rounded-lg font-medium hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity"
            >
              Create Project
            </button>
          </div>
        </Modal>

        {/* Delete Confirmation Modal */}
        <Modal isOpen={showDeleteModal} onClose={() => setShowDeleteModal(false)} title="Delete Project">
          <p className="text-black dark:text-white">Are you sure you want to delete the project "{projectToDelete?.name}"? This action cannot be undone.</p>
          <div className="flex justify-end gap-3 mt-4">
            <button
              onClick={() => setShowDeleteModal(false)}
            className="px-5 py-2 rounded-lg bg-navbar-light/30 dark:bg-navbar-dark/80  border-[1px] border-border-light dark:border-border-dark
                        text-black dark:text-white hover:bg-navbar-light/50 dark:hover:bg-navbar-dark
                        transition-all duration-200 font-medium 
                        hover:border-black dark:hover:border-white"
                >
                Cancel
            </button>
            <button
              onClick={handleDelete}
              className="px-4 py-2.5 bg-red-500 text-white rounded-lg font-medium hover:opacity-90 transition-opacity"
            >
              Delete
            </button>
          </div>
        </Modal>
      </main>
      <Footer className="mt-auto" />

      <style jsx>{`
        .line-clamp-1 {
          display: -webkit-box;
          -webkit-line-clamp: 1;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
    </div>
  );
};

export default Projects;

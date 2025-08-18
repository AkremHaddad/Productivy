import React from 'react';
import Navbar from '../allPages/Navbar';
import Footer from '../allPages/Footer';

const Projects = () => {
  return (
    <div className="flex flex-col min-h-screen overflow-x-hidden">
      <Navbar />
      <main className='flex-1 bg-background-light dark:bg-background-dark p-6'>
        <h1 className="mt-4 text-3xl font-bold text-secondary-light dark:text-accent place-self-center">My projects</h1>
        <div className="mt-4">fetch from user projects</div>
      </main>
      <Footer className="mt-auto" />
    </div>
  );
}

export default Projects;
import React from 'react';
import { FaGithub, FaLinkedin, FaEnvelope } from "react-icons/fa";

function Footer() {
  return (
    <footer className='bg-navbar-light w-screen dark:bg-navbar-dark h-14 flex items-center'>
      <p className='ml-2  dark:text-text-dark'>Developed by Akram Haddad</p>
      <div className="flex items-center space-x-4 ml-auto mr-8">
        <a
          href="mailto:akremhaddad125@gmail.com"
          className="dark:text-text-dark hover:text-accent transition-colors"
          aria-label="Email"
        >
          <FaEnvelope className="w-6 h-6" />
        </a>

        <a
          href="https://github.com/akremhaddad"
          target="_blank"
          rel="noopener noreferrer"
          className="dark:text-text-dark hover:text-accent transition-colors"
          aria-label="GitHub"
        >
          <FaGithub className="w-6 h-6" />
        </a>

        <a
          href="https://www.linkedin.com/in/akrem-haddad"
          target="_blank"
          rel="noopener noreferrer"
          className="dark:text-text-dark hover:text-accent transition-colors"
          aria-label="LinkedIn"
        >
          <FaLinkedin className="w-6 h-6" />
        </a>
      </div>
    </footer>
  );
}

export default Footer;
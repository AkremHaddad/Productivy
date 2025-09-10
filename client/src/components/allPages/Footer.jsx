import React from 'react';
import { FaGithub, FaLinkedin, FaEnvelope, FaHeart } from "react-icons/fa";

function Footer() {
  return (
    <footer className='bg-navbar-light dark:bg-navbar-dark w-full py-4 px-6 select-none flex flex-col sm:flex-row items-center justify-between mt-auto'>
      <div className="flex items-center mb-3 sm:mb-0">
        <p className='text-gray-300 text-sm sm:text-base flex items-center'>
          Developed with <FaHeart className="text-red-500 mx-1" /> by Akrem Haddad
          <span className="hidden md:inline-flex ml-2">| © {new Date().getFullYear()}</span>
        </p>
      </div>
      
      {/* Social icons */}
      <div className="flex items-center space-x-5">
        <a
          href="mailto:akremhaddad125@gmail.com"
          aria-label="Email"
          className="transition-transform duration-200 hover:scale-110 hover:text-accent"
        >
          <FaEnvelope className="w-6 h-6 text-gray-300" />
        </a>

        <a
          href="https://github.com/akremhaddad"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="GitHub"
          className="transition-transform duration-200 hover:scale-110 hover:text-gray-100"
        >
          <FaGithub className="w-6 h-6 text-gray-300" />
        </a>

        <a
          href="https://www.linkedin.com/in/akrem-haddad"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="LinkedIn"
          className="transition-transform duration-200 hover:scale-110 hover:text-blue-500"
        >
          <FaLinkedin className="w-6 h-6 text-gray-300" />
        </a>
      </div>
    </footer>
  );
}

export default Footer;
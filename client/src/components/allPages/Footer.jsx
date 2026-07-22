import React from 'react';
import { FaGithub, FaLinkedin, FaEnvelope, FaHeart } from "react-icons/fa";

function Footer() {
  return (
    <footer className='bg-ui-light dark:bg-ui-dark w-full py-4 px-6 select-none flex flex-col sm:flex-row items-center justify-between mt-auto border-t-[1px] border-border-light dark:border-border-dark'>
      <div className="flex items-center mb-3 sm:mb-0">
        <p className='text-black dark:text-white  text-sm sm:text-base flex items-center'>
          Developed with <FaHeart className="text-red-500 mx-1" /> by Akrem Haddad
          <span className="hidden md:inline-flex ml-2">| © {new Date().getFullYear()}</span>
        </p>
      </div>
      
      {/* Social links - labeled chips, not bare icons */}
      <div className="flex items-center gap-2">
        <a
          href="mailto:akremhaddad125@gmail.com"
          className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-border-light dark:border-border-dark text-text-light dark:text-text-dark hover:bg-header-light dark:hover:bg-header-dark transition-colors"
        >
          <FaEnvelope className="w-4 h-4" />
          <span className="text-sm font-semibold">Contact</span>
        </a>

        <a
          href="https://github.com/akremhaddad"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-border-light dark:border-border-dark text-text-light dark:text-text-dark hover:bg-header-light dark:hover:bg-header-dark transition-colors"
        >
          <FaGithub className="w-4 h-4" />
          <span className="text-sm font-semibold">GitHub</span>
        </a>

        <a
          href="https://www.linkedin.com/in/akrem-haddad"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-border-light dark:border-border-dark text-text-light dark:text-text-dark hover:bg-header-light dark:hover:bg-header-dark transition-colors"
        >
          <FaLinkedin className="w-4 h-4" />
          <span className="text-sm font-semibold">LinkedIn</span>
        </a>
      </div>
    </footer>
  );
}

export default Footer;
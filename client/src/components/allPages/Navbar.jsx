import React from 'react';
import { Squares2X2Icon, UserCircleIcon } from "@heroicons/react/24/outline";
import ThemeToggle from './ThemeToggle';

function Navbar() {
  return (
    <nav className='bg-[#222] w-screen dark:bg-[#121212] h-14 flex items-center select-none shadow-md shadow-black/50 dark:shadow-white/10'>
      <a href="/">
        <img src="/logo.svg" alt="Productivy Logo" className="h-10 ml-2 rounded-sm" />
      </a>
      <p className='ml-2 font-jaro text-secondary-light dark:text-accent text-2xl'>Productivy</p>
      <ul className='flex ml-auto mr-8 space-x-4 items-center'>
        <li>
          <a href="/projects" className="flex items-center justify-center">
            <Squares2X2Icon className="h-6 w-6 text-text-dark hover:text-secondary-light dark:hover:text-accent transition-colors" />
          </a>
        </li>
        <li>
          <ThemeToggle />
        </li>
        <li>
          <a href="/account" className="flex items-center justify-center">
            <UserCircleIcon className="h-6 w-6 text-text-dark hover:text-secondary-light dark:hover:text-accent transition-colors" />
          </a>
        </li>
      </ul>
    </nav>
  );
}

export default Navbar;

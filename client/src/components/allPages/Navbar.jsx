import React from 'react';
import { Squares2X2Icon, UserCircleIcon } from "@heroicons/react/24/outline";
import ThemeToggle from './ThemeToggle';

function Navbar() {
  return (
    <nav className='bg-ui-light w-screen dark:bg-ui-dark h-14 flex items-center select-none shadow-sm shadow-border-light dark:shadow-border-dark'>
      <a href="/">
        <img src="/logo.svg" alt="Productivy Logo" className="h-10 ml-2 rounded-sm" />
      </a>
      <p className='ml-2 text-black dark:text-white text-2xl'>Productivy</p>
      <ul className='flex ml-auto mr-8 space-x-4 items-center'>
        <li>
          <a href="/projects" className="flex items-center justify-center">
            <Squares2X2Icon className="h-6 w-6 text-black dark:text-white " />
          </a>
        </li>
        <li>
          <ThemeToggle />
        </li>
        <li>
          <a href="/account" className="flex items-center justify-center">
            <UserCircleIcon className="h-6 w-6 text-black dark:text-white" />
          </a>
        </li>
      </ul>
    </nav>
  );
}

export default Navbar;

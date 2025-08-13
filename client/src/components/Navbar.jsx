import React from 'react';
import {Squares2X2Icon } from "@heroicons/react/24/outline";
import ThemeToggle from './ThemeToggle';

function Navbar() {
  return (
    <nav className='bg-navbar-light w-screen dark:bg-navbar-dark h-14 flex items-center'>
        <img src="/logo.svg" alt="Productivy Logo" className="h-10 ml-2 rounded-sm" />
        <p className='ml-2 font-jaro text-accent text-2xl'>Productivy</p>
        <ul className='flex ml-auto mr-8 space-x-4 items-center'>
          <li>
            <button className="flex items-center justify-center">
              <Squares2X2Icon className="h-6 w-6 text-text-dark hover:text-accent" />
            </button>
          </li>
          <li>
            <ThemeToggle />
          </li>
          <li>
            <a href="#" className='font-inter text-text-dark hover:text-accent'>Account</a>
          </li>
        </ul>
    </nav>
  );
}

export default Navbar;
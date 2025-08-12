import React from 'react';
import { SunIcon, MoonIcon, Squares2X2Icon } from "@heroicons/react/24/outline";

function Navbar() {
  return (
    <nav className='w-screen bg-navbar-dark h-14 flex items-center'>
        <img src="/logo.svg" alt="Productivy Logo" className="h-10 ml-2 rounded-sm" />
        <p className='ml-2 font-jaro text-accent text-2xl'>Productivy</p>
        <ul className='flex ml-auto mr-4 space-x-4'>
          <li>
            <button>
                <Squares2X2Icon className="h-6 w-6 text-text-dark hover:text-accent" />
            </button>
          </li>
          <li>
            <button>
                <SunIcon className="h-6 w-6 text-text-dark hover:text-accent" />
            </button>
          </li>
          <li>
            <a href="#" className='font-inter text-text-dark hover:text-accent'>Account</a>
          </li>
        </ul>
    </nav>
  );
}

export default Navbar;
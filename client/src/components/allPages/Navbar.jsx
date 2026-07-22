import React from 'react';
import { NavLink } from 'react-router';
import { Squares2X2Icon, UserCircleIcon } from "@heroicons/react/24/outline";
import ThemeToggle from './ThemeToggle';
import { useActivity } from '../../api/useActivity';

const navLinkClass = ({ isActive }) =>
  `text-sm font-semibold pb-1 border-b-2 transition-colors ${
    isActive
      ? "text-text-light dark:text-text-dark border-accent"
      : "text-secondary-light dark:text-secondary-dark border-transparent hover:text-text-light dark:hover:text-text-dark"
  }`;

const StatusPill = () => {
  const { currentActivity, loading, toggleActivity } = useActivity();
  const isWorking = currentActivity === "working";

  return (
    <button
      onClick={() => !loading && toggleActivity()}
      title="Click to toggle working / off"
      className="flex items-center gap-2 bg-header-light dark:bg-header-dark border border-border-light dark:border-border-dark rounded-full pl-2 pr-3 py-1.5"
    >
      <span className={`w-2 h-2 rounded-full flex-none ${isWorking ? "bg-[#8B7CF6] animate-pulse" : "bg-secondary-dark"}`} />
      <span className="text-xs font-semibold text-text-light dark:text-text-dark capitalize">
        {loading ? "Saving..." : currentActivity || "No activity"}
      </span>
    </button>
  );
};

function Navbar() {
  const { authenticated } = useActivity();

  return (
    <nav className='bg-ui-light dark:bg-ui-dark w-screen h-14 flex items-center select-none border-b border-border-light dark:border-border-dark px-4 gap-6'>
      <a href="/" className="flex items-center gap-2 flex-none">
        <img src="/logo.svg" alt="Productivy Logo" className="h-9 rounded-sm" />
        <span className='text-text-light dark:text-text-dark text-xl font-bold'>Productivy</span>
      </a>

      <div className="hidden sm:flex items-center gap-6">
        <NavLink to="/projects" className={navLinkClass}>Projects</NavLink>
        <NavLink to="/account" className={navLinkClass}>Dashboard</NavLink>
      </div>

      <a href="/projects" className="sm:hidden flex items-center justify-center">
        <Squares2X2Icon className="h-6 w-6 text-black dark:text-white" />
      </a>

      <ul className='flex ml-auto items-center gap-3'>
        {authenticated && (
          <li>
            <StatusPill />
          </li>
        )}
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

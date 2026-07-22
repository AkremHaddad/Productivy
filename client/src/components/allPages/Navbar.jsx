import React from 'react';
import { NavLink } from 'react-router';
import ThemeToggle from './ThemeToggle';
import { useActivity } from '../../api/useActivity';

const navLinkClass = ({ isActive }) =>
  `text-sm font-semibold pb-1 border-b-2 transition-colors whitespace-nowrap ${
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
    <nav className='bg-ui-light dark:bg-ui-dark w-full h-14 flex items-center justify-between select-none border-b border-border-light dark:border-border-dark px-3 sm:px-4 gap-2'>
      {/* Left: brand only. Wordmark text drops below sm - logo + everything
          on the right was overflowing a 375px viewport otherwise. */}
      <a href="/" className="flex items-center gap-2 flex-none min-w-0">
        <img src="/logo.svg" alt="Productivy Logo" className="h-9 rounded-sm flex-none" />
        <span className='hidden sm:inline text-text-light dark:text-text-dark text-xl font-bold whitespace-nowrap'>Productivy</span>
      </a>

      {/* Right: everything else - nav, status, theme. No separate account icon:
          "Dashboard" already goes to /account, a second icon for the same
          destination was pure redundancy. */}
      <div className="flex items-center gap-2 sm:gap-5 min-w-0">
        <NavLink to="/projects" className={navLinkClass}>Projects</NavLink>
        <NavLink to="/account" className={navLinkClass}>Dashboard</NavLink>
        {authenticated && <StatusPill />}
        <ThemeToggle />
      </div>
    </nav>
  );
}

export default Navbar;

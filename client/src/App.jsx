import React from 'react';
import { Routes, Route, Outlet } from "react-router";
import Home from './components/pages/Home';
import Projects from './components/pages/Projects';
import Project from './components/pages/Project';
import Account from './components/pages/Account';
import Navbar from './components/allPages/Navbar';
import { ActivityProvider } from './context/ActivityContext';
import { PomodoroProvider } from './context/PomodoroContext';

// Navbar now hosts the Pomodoro/Time pills (see Navbar.jsx), whose state
// (PomodoroContext) must survive page navigation - a running timer can't
// silently pause every time the route changes. That only works if Navbar
// mounts once, not once per page, hence this shared layout route instead of
// each page rendering its own <Navbar/>. Footer stays per-page (Project.jsx
// deliberately has none) - only Navbar moved here.
const Layout = () => (
  <>
    <Navbar />
    <Outlet />
  </>
);

function App() {
  return (
    <div className="App" >
      <ActivityProvider>
        <PomodoroProvider>
          <Routes>
            <Route element={<Layout />}>
              <Route path="/" element={<Home />} />
              <Route path="/account" element={<Account />} />
              <Route path="/projects" element={<Projects />} />
              <Route path="/project/:id" element={<Project />} />
            </Route>
          </Routes>
        </PomodoroProvider>
      </ActivityProvider>
    </div>
  );
}


export default App;

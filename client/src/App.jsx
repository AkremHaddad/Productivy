import React from 'react';
import { Routes, Route } from "react-router";
import Home from './components/pages/Home';
import Projects from './components/pages/Projects';
import Project from './components/pages/Project';
import Account from './components/pages/Account';
import { ActivityProvider } from './context/ActivityContext';

function App() {
  return (
    <div className="App" >
      <ActivityProvider>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/account" element={<Account />} />
          <Route path="/projects" element={<Projects />} />
          <Route path="/project/:id" element={<Project />} />
        </Routes>
      </ActivityProvider>
    </div>
  );
}


export default App;

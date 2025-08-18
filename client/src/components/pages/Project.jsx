import React from 'react';
import Navbar from '../allPages/Navbar';
import Footer from '../allPages/Footer';
import Pomodoro from '../project/Pomodoro';
import Status from '../project/Status';
import Time from '../project/Time';
import Sprints from '../project/Sprints';
import Kanban from '../project/Kanban';
import Tabs from '../project/Tabs';
import ToolsFooter from '../project/ToolsFooter';
import Board from '../project/Board';

const Project = () => {
  return (
    <div className="flex flex-col min-h-screen overflow-x-hidden">
      <Navbar />
        <Tabs/>
        <div className='flex-1 flex bg-background-light dark:bg-black p-5'>
            <div className='flex flex-col gap-1.5 w-[500px]'>
                <div className='flex flex-row gap-1.5'>
                    <Pomodoro/>
                    <Status/>
                    <Time/>
                </div>
                <div className='flex flex-row gap-1.5'>
                    <Sprints/>
                    <Kanban/>
                </div>
                <div className='flex flex-row gap-1.5'>
                    <ToolsFooter/>
                </div>
            </div>
            <Board />
        <div>

        </div>
      </div>
      {/* <Footer className="mt-auto" /> */}
    </div>
  );
}

export default Project;
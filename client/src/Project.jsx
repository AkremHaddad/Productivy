import React from 'react';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Pomodoro from './components/Pomodoro';
import Status from './components/Status';
import Time from './components/Time';
import Sprints from './components/Sprints';
import Kanban from './components/Kanban';
import Tabs from './components/Tabs';
import ToolsFooter from './components/ToolsFooter';

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
            <div className='ml-1.5 bg-accent-light dark:bg-accent-dark rounded-md flex-1'>
                <div className='bg-black bg-opacity-25 min-h-[60px] font-normal text-3xl text-white content-center pl-4 rounded-t-md'>title</div>
            </div>
        <div>

        </div>
      </div>
      {/* <Footer className="mt-auto" /> */}
    </div>
  );
}

export default Project;
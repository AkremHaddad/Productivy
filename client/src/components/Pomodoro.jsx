import React from 'react'

const Pomodoro = () => {
  return (
    <div id="pomodoro" className='flex-1 justify-around bg-secondary-light dark:bg-secondary-dark h-[150px]  rounded-md flex flex-col justify-between'> 
      <div className='font-normal text-xl text-white  text-center'>Pomodoro</div>
      <div className='font-normal text-md text-accent text-center'>25:00</div>
      <div className='flex gap-2 justify-center '>
        <button className=''>
          <img src="./start.svg" alt="start"/>
        </button>
        <button className=''>
          <img src="./restart.svg" alt="restart" />
        </button>
        <button className=''>
          <img src="./timer.svg" alt="timer" />
        </button>
      </div>
    </div>
    
  )
}

export default Pomodoro

import React from 'react'

const Time = () => {
  return (
    <div id="Time" className='flex-1 justify-around bg-secondary-light dark:bg-secondary-dark h-[150px]  rounded-md flex flex-col justify-between'> 
      <div className='font-normal text-md text-white  text-center'>Productive time today</div>
      <div className='font-normal text-md text-accent text-center'>1:22:33</div>
      <div className='flex justify-center max-h-[24px]'>
        <img src="../worker.svg" alt="" />
      </div>
    </div>
  )
}

export default Time

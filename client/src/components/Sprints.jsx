import React from 'react'

const Sprints = () => {
  return (
    <div id="sprints" className='flex-1 bg-primary-light dark:bg-primary-dark h-[350px] rounded-md'>
        <div className='bg-black bg-opacity-25 h-[40px] text-white content-center text-center font-medium'>
            Sprints
        </div>
        <ul className='p-2 flex flex-col text-text-dark gap-2'>
            <li>Sprint 1</li>
            <li>Sprint 2</li>
            <li>Sprint 3</li>
        </ul>
    </div>
  )
}

export default Sprints

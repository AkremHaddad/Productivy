import React from 'react'

const Kanban = () => {
  return (
    <div id="kanban" className='flex-1 bg-primary-light dark:bg-primary-dark h-[350px] rounded-md'>
        <div className='bg-black bg-opacity-25 h-[40px] text-white content-center text-center font-medium'>
            Sprint tasks
        </div>
        <ul className='p-2 flex flex-col text-text-dark gap-2'>
            <div className='flex items-center'>
                <li>Task 1</li>
                <div className='ml-auto hover:cursor-pointer'>[  ]</div>
            </div>
            <div className='flex items-center'>
                <li>Task 2</li>
                <div className='ml-auto hover:cursor-pointer'>[  ]</div>
            </div>
            <div className='flex items-center'>
                <li>Task 3</li>
                <div className='ml-auto hover:cursor-pointer'>[  ]</div>
            </div>
            <div className='flex items-center'>
                <li>Task 4</li>
                <div className='ml-auto hover:cursor-pointer'>[  ]</div>
            </div>
            <div className='flex items-center'>
                <li>Task 5</li>
                <div className='ml-auto hover:cursor-pointer'>[  ]</div>
            </div>
        </ul>
    </div>
  )
}

export default Kanban

import React from 'react'

const ToolsFooter = () => {
  return (
    <>
        <div id="analyse" className='bg-secondary-light dark:bg-secondary-dark h-[100px] w-[100px] rounded-md text-center flex justify-center items-center dark:text-white'>Analyse my activity</div>
        <div id="calendar" className='bg-secondary-light dark:bg-secondary-dark h-[100px] flex-grow rounded-md p-2'>
            <div className=' dark:text-white'>Your calendar suggestion:</div>
            <div className='dark:text-white'>• sleep</div>
        </div>
    </>
  )
}

export default ToolsFooter

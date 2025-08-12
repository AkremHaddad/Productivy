import React from 'react';
import Navbar from './components/Navbar';
import Footer from './components/Footer';

function Home() {
  return (
    <div className="min-h-screen">
      <Navbar />
      <main className='bg-background-dark '>
        <div className='min-h-44 place-content-center'>
          <h1 className="text-4xl font-bold text-accent place-self-center">Welcome to Productivy</h1>
          {/* Add your Figma content here */}
        </div>
      </main>
      <Footer />
    </div>
  );
}

export default Home;
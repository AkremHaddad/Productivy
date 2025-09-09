import React, { useEffect } from 'react';
import Navbar from '../allPages/Navbar';
import Footer from '../allPages/Footer';
import AOS from 'aos';
import 'aos/dist/aos.css';

function Home() {
  useEffect(() => {
    AOS.init({ duration: 1000, once: true }); // Initialize AOS animations
  }, []);

  return (
    <div className="min-h-screen overflow-x-hidden bg-background-light dark:bg-background-dark">
      <div className="fixed inset-x-0 top-0 z-50">
        <Navbar />
      </div>
      <main className="pt-14">
        {/* Hero Section */}
        <section className="bg-black bg-opacity-25 text-white min-h-[92vh] flex items-center">
          <div className="container mx-auto flex flex-col md:flex-row items-center justify-between px-4">
            {/* Left text */}
            <div data-aos="fade-right" className="max-w-xl px-4">
              <h1 className="text-4xl md:text-5xl font-bold text-secondary-dark dark:text-accent leading-tight">
                Stay Focused. Plan Smarter. Get More Done.
              </h1>
              <p className="mt-4 text-lg text-text-light dark:text-text-dark">
                Organize your projects, stay focused with Pomodoro timers, and track your sprints — all in one simple tool.
              </p>
              <div className="mt-6 flex gap-4">
                <a href="/account" className="bg-secondary-dark hover:bg-secondary-light dark:bg-accent dark:hover:opacity-90 text-black font-semibold py-3 px-6 rounded-lg transition-all">
                  Get Started Free
                </a>
                <a
                  href="#features"
                  onClick={(e) => {
                    e.preventDefault();
                    document.getElementById("features")?.scrollIntoView({
                      behavior: "smooth",
                    });
                  }}
                  className="border-2 border-secondary-dark text-secondary-dark hover:bg-secondary-dark hover:text-black dark:border-accent dark:text-accent dark:hover:bg-accent dark:hover:text-black font-semibold py-3 px-6 rounded-lg transition-all"
                >
                  See How It Works
                </a>
              </div>
            </div>

            {/* Right image */}
            <div data-aos="fade-left" className="perspective-1000 mt-8 md:mt-0 px-4">
              <img
                src="./heromockup.png"
                alt="App preview"
                className="w-full max-w-xlg transition-transform duration-700 hover:rotate-y-0 hover:rotate-x-0"
              />
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-20 px-4 bg-background-light dark:bg-background-dark">
          <div className="container mx-auto">
            <h2 data-aos="fade-up" className="text-3xl font-bold text-center text-primary-dark dark:text-accent mb-12 px-4">
              Powerful Features to Boost Your Productivity
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 px-4">
              {[
                {
                  title: "AI-Powered Insights",
                  desc: "Our AI analyzes your work patterns to suggest optimal study times, predict productivity windows, and provide weekly performance overviews.",
                  icon: (
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"></path>
                    </svg>
                  ),
                },
                {
                  title: "Kanban Boards",
                  desc: "Visualize your workflow with customizable Kanban boards. Move tasks through stages from 'To-Do' to 'Done' with simple drag-and-drop.",
                  icon: (
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2"></path>
                    </svg>
                  ),
                },
                {
                  title: "Sprint Planning",
                  desc: "Break your work into manageable sprints. Set goals, track progress, and review accomplishments to maintain steady momentum.",
                  icon: (
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
                    </svg>
                  ),
                },
                {
                  title: "Pomodoro Timer",
                  desc: "Built-in Pomodoro timer with customizable work/break intervals. Stay focused and prevent burnout with structured work sessions.",
                  icon: (
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                  ),
                },
                {
                  title: "Smart Task Lists",
                  desc: "Prioritize, categorize, and schedule tasks with ease. Set deadlines, add reminders, and break large tasks into subtasks.",
                  icon: (
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
                    </svg>
                  ),
                },
                {
                  title: "Calendar Integration",
                  desc: "Sync with your favorite calendar apps to see all your tasks and events in one place. Schedule work sessions and never miss a deadline.",
                  icon: (
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                    </svg>
                  ),
                },
              ].map((feature, index) => (
                <div
                  key={index}
                  data-aos="fade-up"
                  data-aos-delay={index * 100}
                  className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow"
                >
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-xl font-semibold text-gray-800 dark:text-white">{feature.title}</h3>
                    <div className="text-secondary-dark dark:text-accent">{feature.icon}</div>
                  </div>
                  <p className="text-gray-600 dark:text-gray-300">{feature.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}

export default Home;

import React, { useEffect } from 'react';
import Navbar from '../allPages/Navbar';
import Footer from '../allPages/Footer';
import AOS from 'aos';
import 'aos/dist/aos.css';
import ProductShowcase from '../ProductShowcase';

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
        <section className="bg-background-light dark:bg-black text-white min-h-[92vh] flex items-center">
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
          </div>
        </section>

        {/* Product Showcase Section */}
        <ProductShowcase />

        {/* Features Section */}
        <section id="features" className="py-20 px-4 bg-background-light dark:bg-background-dark">
          <div className="container mx-auto">
            <h2 data-aos="fade-up" className="text-3xl font-bold text-center text-secondary-dark dark:text-accent mb-12 px-4">
              Powerful Features to Boost Your Productivity
            </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 px-4">
            {[
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
                title: "Project Boards",
                desc: "Create multiple boards per project and organize them your way. Each board can contain columns, and each column can hold cards with titles and descriptions — perfect for detailed workflows.",
                icon: (
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 7h18M3 12h18M3 17h18M4 6v12M20 6v12"></path>
                  </svg>
                ),
              },
              {
                title: "Activity Visualizer",
                desc: "Track and visualize how you spend your time with charts and daily summaries. See where your focus goes and optimize your workflow.",
                icon: (
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 3v18M5 9h6m-6 6h6m4 3h4m-4-6h4m-4-6h4"></path>
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

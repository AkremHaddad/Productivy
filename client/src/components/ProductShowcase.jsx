import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "../api/useTheme";

export default function ProductShowcase({ isDarkProp = undefined }) {
  const [activeTab, setActiveTab] = useState("tools");
  const [isHovered, setIsHovered] = useState(false);

  // synchronous helper (same logic as Home)
  const getInitialIsDark = () => {
    try {
      if (typeof window === "undefined" || typeof document === "undefined") return false;
      if (document.documentElement.classList.contains("dark")) return true;
      const stored = localStorage.getItem("theme");
      if (stored === "dark" || stored === "true") return true;
      if (stored === "light" || stored === "false") return false;
      return window.matchMedia?.("(prefers-color-scheme: dark)").matches ?? false;
    } catch {
      return false;
    }
  };

  // If parent passed isDarkProp use it, otherwise compute initial value
  const initialIsDark = typeof isDarkProp === "boolean" ? isDarkProp : getInitialIsDark();

  // local theme state: initialized synchronously for correct first paint
  const [isDarkMode, setIsDarkMode] = useState(initialIsDark);

  // liveTheme updates when the DOM/class changes (useTheme observes mutations)
  const liveTheme = useTheme();
  useEffect(() => {
    // prefer parent prop if provided (keeps Home in control)
    if (typeof isDarkProp === "boolean") {
      setIsDarkMode(isDarkProp);
    } else {
      setIsDarkMode(liveTheme);
    }
  }, [liveTheme, isDarkProp]);

  const features = {
    tools: {
      title: "Focus Tools",
      description:
        "Stay on top of your time with built-in Pomodoro timers, daily activity tracking, and summaries of your focused hours. Simple visuals keep you motivated and aware of your progress.",
      icon: "⏱️",
      benefits: ["Time Tracking", "Progress Reports", "Pomodoro Timer"],
      image: "tools",
    },
    sprints: {
      title: "Sprint Management",
      description:
        "Organize work into sprints with dedicated tabs. Plan, track, and execute tasks in a Kanban-style board, keeping your team aligned and your goals achievable.",
      icon: "📊",
      benefits: ["Sprint Planning", "Team Collaboration", "Progress Tracking"],
      image: "sprints",
    },
    boards: {
      title: "Boards & Workflow",
      description:
        "Create and customize boards for any project. Add, rename, and delete boards with ease. Organize columns by color, add cards with descriptions, and visualize your workflow from start to finish.",
      icon: "📋",
      benefits: ["Custom Boards", "Visual Workflow", "Task Management"],
      image: "boards",
    },
  };

  const activeFeature = features[activeTab];

  // initialize imageSrc synchronously (so refresh shows the correct image)
  const [imageSrc, setImageSrc] = useState(() =>
    isDarkMode ? `./${activeFeature.image}.png` : `./${activeFeature.image}_light.png`
  );

  // update image src when theme or active tab changes
  useEffect(() => {
    setImageSrc(isDarkMode ? `./${activeFeature.image}.png` : `./${activeFeature.image}_light.png`);
  }, [isDarkMode, activeTab, activeFeature.image]);

  // Auto-rotate tabs every 5s
  useEffect(() => {
    const interval = setInterval(() => {
      if (!isHovered) {
        const keys = Object.keys(features);
        const currentIndex = keys.indexOf(activeTab);
        const nextIndex = (currentIndex + 1) % keys.length;
        setActiveTab(keys[nextIndex]);
      }
    }, 5000);
    return () => clearInterval(interval);
  }, [activeTab, isHovered]);

  return (
    <section className="py-20 px-4 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-[#090909] dark:to-[#111111]">
      <div className="container mx-auto text-center max-w-6xl">
        <h2 className="text-4xl font-bold text-secondary-dark dark:text-accent mb-4">
          Boost Your Productivity
        </h2>
        <p className="text-lg text-gray-600 dark:text-gray-400 mb-12 max-w-2xl mx-auto">
          Discover how Productivy helps teams and individuals accomplish more with less effort
        </p>

        {/* Tabs */}
        <div
          className="flex flex-wrap justify-center gap-4 mb-16"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          {Object.keys(features).map((key) => (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              className={`flex items-center px-6 py-3 rounded-xl font-medium transition-all duration-300 ${
                activeTab === key
                  ? "bg-secondary-light dark:bg-accent text-white shadow-lg transform -translate-y-1"
                  : "bg-white dark:bg-black text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 shadow-md"
              }`}
            >
              <span className="mr-2 text-xl">{features[key].icon}</span>
              {features[key].title}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex flex-col lg:flex-row items-center gap-12 bg-white dark:bg-black rounded-2xl p-8 shadow-xl">
          {/* Description */}
          <AnimatePresence mode="wait">
            <motion.div
              key={`desc-${activeTab}`}
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 30 }}
              transition={{ duration: 0.4 }}
              className="flex-1 text-left"
            >
              <div className="flex items-center mb-6">
                <span className="text-3xl mr-3">{activeFeature.icon}</span>
                <h3 className="text-2xl font-semibold text-secondary-dark dark:text-accent">{activeFeature.title}</h3>
              </div>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-6">{activeFeature.description}</p>

              <div className="mb-8">
                <h4 className="font-medium text-secondary-dark dark:text-gray-300 mb-3">Key Benefits:</h4>
                <ul className="space-y-2">
                  {activeFeature.benefits.map((benefit, index) => (
                    <li key={index} className="flex items-center text-gray-600 dark:text-gray-400">
                      <span className="w-2 h-2 bg-accent rounded-full mr-3" />
                      {benefit}
                    </li>
                  ))}
                </ul>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Image */}
          <AnimatePresence mode="wait">
            <motion.div
              key={`img-${activeTab}`}
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -30 }}
              transition={{ duration: 0.5 }}
              className="flex-1 relative flex justify-center"
            >
              <div className="relative rounded overflow-hidden shadow-2xl max-w-md">
                <img
                  src={imageSrc}
                  alt={activeFeature.title}
                  className="w-full h-auto object-contain transition-transform duration-700 transform hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300"></div>
              </div>

            </motion.div>
          </AnimatePresence>
        </div>

        {/* Indicators */}
        <div className="flex justify-center mt-8 space-x-2">
          {Object.keys(features).map((key) => (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              className={`w-3 h-3 rounded-full transition-all duration-300 ${activeTab === key ? "bg-accent scale-125" : "bg-gray-300 dark:bg-gray-600"}`}
              aria-label={`Show ${features[key].title}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

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
    <section className="py-20 px-4 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-[#090909] dark:to-[#111111]
    ">
      <div>
        <img src={`../${imageSrc}`} alt="" />
      </div>
    </section>
  );
}

import React, { useEffect, useState } from "react";
import Footer from "../allPages/Footer";
import AOS from "aos";
import "aos/dist/aos.css";
import { useTheme } from "../../api/useTheme";
import showcaseLight from "../../../public/showcaseLight.png";
import showcaseDark from "../../../public/showcaseDark.png";

/**
 * Synchronous theme detection helper
 * - checks <html>.dark, localStorage 'theme', then system pref
 */
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

const FEATURES = [
  {
    title: "Kanban Boards",
    desc: "Multiple boards per project, custom column colors, and drag-and-drop cards.",
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2"></path>
      </svg>
    ),
  },
  {
    title: "Sprint Planning",
    desc: "Break projects into sprints with their own task lists and progress.",
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
      </svg>
    ),
  },
  {
    title: "Pomodoro Timer",
    desc: "Customizable work/break intervals with an alarm to protect deep focus.",
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
      </svg>
    ),
  },
  {
    title: "Focus Tracking",
    desc: "Time worked shown against a daily goal, with streaks and a weekly heatmap.",
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <circle cx="12" cy="12" r="9" strokeWidth="1.8" opacity="0.35" />
        <path strokeLinecap="round" strokeWidth="1.8" d="M12 3a9 9 0 016.4 15.4" />
      </svg>
    ),
  },
  {
    title: "Session Recaps",
    desc: "A daily summary auto-written from what moved on your boards and timer.",
    icon: (
      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
        <rect x="2" y="4" width="20" height="3.5" rx="1.5"></rect>
        <rect x="2" y="10.5" width="14" height="3.5" rx="1.5" opacity="0.6"></rect>
        <rect x="2" y="17" width="9" height="3.5" rx="1.5" opacity="0.3"></rect>
      </svg>
    ),
  },
  {
    title: "Milestones",
    desc: "Total focus hours, longest streak, sprints shipped — quiet, not gamey.",
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M12 2l10 18H2L12 2z"></path>
      </svg>
    ),
  },
];

const STACK = ["React", "Vite", "Tailwind", "Built solo · used daily"];

function Home() {
  // synchronous initial theme value used for first render
  const initialIsDark = getInitialIsDark();
  const [isDark, setIsDark] = useState(initialIsDark);

  // `useTheme()` will update liveTheme whenever the theme toggles
  const liveTheme = useTheme();

  // themeReady prevents hydration flicker; set true after mount
  const [themeReady, setThemeReady] = useState(false);
  useEffect(() => {
    setThemeReady(true);
  }, []);

  // Update local isDark when liveTheme changes
  useEffect(() => {
    setIsDark(liveTheme);
  }, [liveTheme]);

  // Get the appropriate showcase image based on theme
  const showcaseImage = isDark ? showcaseDark : showcaseLight;

  useEffect(() => {
    AOS.init({ duration: 1000, once: true });
  }, []);

  // avoid rendering until we've run client mount - prevents mismatch flicker
  if (!themeReady) return null;

  return (
    <div className="min-h-screen overflow-x-hidden bg-background-light dark:bg-background-dark">
      <main>
        {/* Hero Section */}
        <section className="min-h-[92vh] flex items-center">
          <div className="container mx-auto grid md:grid-cols-2 gap-12 items-center px-4 lg:px-8">
            {/* Left: pitch */}
            <div data-aos="fade-right">
              <div className="font-mono text-xs font-semibold tracking-widest uppercase text-accent-light dark:text-accent mb-4">
                Focus tool for solo builders
              </div>
              <h1 className="text-4xl md:text-5xl font-extrabold text-text-light dark:text-text-dark leading-[1.08] tracking-tight">
                Stay in flow.
                <br />
                Ship the side project.
              </h1>
              <p className="text-secondary-light dark:text-secondary-dark mt-5 text-lg max-w-md">
                Pomodoro focus, sprints, and Kanban boards in one place — built to keep you moving on your own projects, one focused session at a time.
              </p>

              <div className="mt-7 flex gap-3 flex-wrap">
                <a
                  href="/account"
                  className="bg-accent hover:opacity-90 text-black font-bold py-3 px-6 rounded-lg transition-all"
                >
                  Get Started Free
                </a>
                <a
                  href="https://github.com/AkremHaddad/Productivy"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="border-[1px] border-border-light dark:border-border-dark text-text-light dark:text-text-dark hover:border-accent-light dark:hover:border-accent font-bold py-3 px-6 rounded-lg transition-all"
                >
                  View Source
                </a>
              </div>

              <div className="mt-6 flex gap-2 flex-wrap">
                {STACK.map((tag) => (
                  <span
                    key={tag}
                    className="font-mono text-[11px] font-semibold text-secondary-light dark:text-secondary-dark border-[1px] border-border-light dark:border-border-dark rounded-full px-3 py-1"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            {/* Right: mini product preview */}
            <div data-aos="fade-left" data-aos-delay="150" className="relative hidden md:block">
              <div className="absolute -inset-8 bg-accent/10 dark:bg-accent/10 blur-3xl rounded-full"></div>
              <div className="relative bg-ui-light dark:bg-ui-dark border-[1px] border-border-light dark:border-border-dark rounded-2xl p-5 shadow-2xl">
                <div className="flex gap-4 mb-4">
                  <svg width="64" height="64" viewBox="0 0 64 64" className="flex-none">
                    <circle cx="32" cy="32" r="26" fill="none" stroke="currentColor" className="text-border-light dark:text-border-dark" strokeWidth="7" />
                    <circle
                      cx="32" cy="32" r="26" fill="none" stroke="currentColor" className="text-accent"
                      strokeWidth="7" strokeLinecap="round" strokeDasharray="106 163" transform="rotate(-90 32 32)"
                    />
                  </svg>
                  <div className="flex-1">
                    <div className="font-mono font-semibold text-lg text-text-light dark:text-text-dark">3h 49m</div>
                    <div className="text-[11px] text-secondary-light dark:text-secondary-dark mb-2">of 6h focus goal</div>
                    <div className="flex gap-1">
                      {[0.3, 0.6, 0.9, 1].map((o, i) => (
                        <div key={i} className="w-3 h-3 rounded-sm bg-accent" style={{ opacity: o }} />
                      ))}
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <div className="bg-header-light dark:bg-header-dark rounded-lg p-2">
                    <div className="text-[10px] font-semibold text-secondary-light dark:text-secondary-dark mb-1.5">To do</div>
                    <div className="h-1.5 rounded bg-accent-light dark:bg-accent opacity-70 mb-1"></div>
                    <div className="h-1.5 rounded bg-accent-light dark:bg-accent opacity-40"></div>
                  </div>
                  <div className="bg-header-light dark:bg-header-dark rounded-lg p-2">
                    <div className="text-[10px] font-semibold text-secondary-light dark:text-secondary-dark mb-1.5">Doing</div>
                    <div className="h-1.5 rounded bg-amber opacity-70"></div>
                  </div>
                  <div className="bg-header-light dark:bg-header-dark rounded-lg p-2">
                    <div className="text-[10px] font-semibold text-secondary-light dark:text-secondary-dark mb-1.5">Done</div>
                    <div className="h-1.5 rounded bg-accent opacity-70 mb-1"></div>
                    <div className="h-1.5 rounded bg-accent opacity-40"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Showcase Section */}
        <section className="py-20 px-4 bg-ui-light dark:bg-ui-dark">
          <div className="container mx-auto">
            <div className="text-center mb-16" data-aos="fade-up">
              <h2 className="text-3xl md:text-4xl font-bold text-text-light dark:text-text-dark mb-4">
                Beautiful, Intuitive Interface
              </h2>
              <p className="text-xl text-secondary-light dark:text-secondary-dark max-w-2xl mx-auto">
                A clean, considered design across both light and dark theme — not an afterthought toggle.
              </p>
            </div>

            <div data-aos="zoom-in" data-aos-delay="200" className="max-w-6xl mx-auto">
              <div className="relative bg-background-light dark:bg-background-dark rounded-2xl shadow-2xl p-2 md:p-4 border-[1px] border-border-light dark:border-border-dark">
                <img
                  src={showcaseImage}
                  alt="Productivy App Interface Showcase"
                  className="w-full h-auto rounded-xl"
                />
                <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-accent rounded-full opacity-20 blur-xl"></div>
                <div className="absolute -top-4 -left-4 w-32 h-32 bg-accent rounded-full opacity-10 blur-xl"></div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-20 px-4 bg-background-light dark:bg-background-dark">
          <div className="container mx-auto">
            <h2 data-aos="fade-up" className="text-3xl font-bold text-center text-text-light dark:text-text-dark mb-12 px-4">
              Powerful Features to Boost Your Productivity
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 px-4">
              {FEATURES.map((feature, index) => (
                <div
                  key={feature.title}
                  data-aos="fade-up"
                  data-aos-delay={index * 100}
                  className="bg-ui-light dark:bg-ui-dark p-6 rounded-2xl shadow-sm hover:shadow-lg transition-shadow border-[1px] border-border-light dark:border-border-dark"
                >
                  <div className="text-accent-light dark:text-accent mb-4">{feature.icon}</div>
                  <h3 className="text-lg font-bold text-text-light dark:text-text-dark mb-2">{feature.title}</h3>
                  <p className="text-secondary-light dark:text-secondary-dark text-sm leading-relaxed">{feature.desc}</p>
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

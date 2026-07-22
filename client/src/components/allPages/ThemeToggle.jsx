import { useEffect, useState } from "react";
import { SunIcon, MoonIcon } from "@heroicons/react/24/outline";

export default function ThemeToggle() {
  const [theme, setTheme] = useState(
    localStorage.getItem("theme") || "light"
  );

  useEffect(() => {
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
    localStorage.setItem("theme", theme);
  }, [theme]);

  return (
    <button
      onClick={() =>
        setTheme(theme === "dark" ? "light" : "dark")
      }
      title="Toggle theme"
      className="flex-none w-[34px] h-[34px] rounded-full bg-header-light dark:bg-header-dark border border-border-light dark:border-border-dark flex items-center justify-center hover:opacity-80 transition-colors duration-200"
    >
      {theme === "dark" ? (
        <MoonIcon className="h-4 w-4 text-secondary-light dark:text-secondary-dark" />
      ) : (
        <SunIcon className="h-4 w-4 text-secondary-light dark:text-secondary-dark" />
      )}
    </button>
  );
}

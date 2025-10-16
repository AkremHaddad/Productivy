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
      className="p-2 rounded-lg transition-colors duration-200"
    >
      {theme === "dark" ? (
        <MoonIcon className="h-6 w-6 text-black dark:text-white" />
      ) : (
        <SunIcon className="h-6 w-6 text-black dark:text-white" />
      )}
    </button>
  );
}

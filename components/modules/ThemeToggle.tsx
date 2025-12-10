"use client";

import { useEffect } from "react";
import { Sun, Moon } from "lucide-react";

export function ThemeToggle() {
  useEffect(() => {
    const themeToggleBtn = document.getElementById("theme-toggle");
    const themeToggleDarkIcon = document.getElementById("theme-toggle-dark-icon");
    const themeToggleLightIcon = document.getElementById("theme-toggle-light-icon");

    if (themeToggleDarkIcon && themeToggleLightIcon) {
      if (
        localStorage.getItem("color-theme") === "dark" ||
        (!("color-theme" in localStorage) &&
          window.matchMedia("(prefers-color-scheme: dark)").matches)
      ) {
        document.documentElement.classList.add('dark');
        themeToggleLightIcon.classList.remove("hidden");
      } else {
        document.documentElement.classList.remove('dark');
        themeToggleDarkIcon.classList.remove("hidden");
      }
    }

    const handleClick = () => {
      if (themeToggleDarkIcon && themeToggleLightIcon) {
        themeToggleDarkIcon.classList.toggle("hidden");
        themeToggleLightIcon.classList.toggle("hidden");
      }

      if (localStorage.getItem("color-theme")) {
        if (localStorage.getItem("color-theme") === "light") {
          document.documentElement.classList.add("dark");
          localStorage.setItem("color-theme", "dark");
        } else {
          document.documentElement.classList.remove("dark");
          localStorage.setItem("color-theme", "light");
        }
      } else {
        if (document.documentElement.classList.contains("dark")) {
          document.documentElement.classList.remove("dark");
          localStorage.setItem("color-theme", "light");
        } else {
          document.documentElement.classList.add("dark");
          localStorage.setItem("color-theme", "dark");
        }
      }
    };

    if (themeToggleBtn) {
      themeToggleBtn.addEventListener("click", handleClick);
    }

    return () => {
      if (themeToggleBtn) {
        themeToggleBtn.removeEventListener("click", handleClick);
      }
    };
  }, []);

  return (
    <button
      type="button"
      id="theme-toggle"
      className="flex h-10 w-10 items-center justify-center rounded-full bg-neutral-200 dark:bg-neutral-700 dark:text-white"
    >
      <span id="theme-toggle-dark-icon" className="hidden">
        <Sun />
      </span>
      <span id="theme-toggle-light-icon" className="hidden">
        <Moon />
      </span>
    </button>
  );
}

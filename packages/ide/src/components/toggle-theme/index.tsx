"use client";
import React, { useState, useEffect } from "react";
import Button from "./button";

export const ToggleTheme = () => {
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    // Access `localStorage` and `window` only after the component mounts on the client
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme === "dark") {
      document.documentElement.classList.add("dark");
      setDarkMode(true);
    } else if (savedTheme === "light") {
      document.documentElement.classList.remove("dark");
      setDarkMode(false);
    } else {
      // Use system preference if no saved theme is found
      const prefersDark = window.matchMedia(
        "(prefers-color-scheme: dark)"
      ).matches;
      if (prefersDark) {
        document.documentElement.classList.add("dark");
        setDarkMode(true);
      }
    }
  }, []);

  // Toggle dark mode and save preference to local storage
  const toggleDarkMode = () => {
    setDarkMode((prev) => !prev);
    if (!darkMode) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  };

  return <Button checked={darkMode} onClick={toggleDarkMode} />;
};

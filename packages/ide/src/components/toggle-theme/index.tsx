"use client";
import Button from "./button";
import { useTheme } from "@/contexts/ThemeContext";

export const ToggleTheme = () => {
  const { darkMode, toggleDarkMode } = useTheme();
  return <Button checked={darkMode} onClick={toggleDarkMode} />;
};

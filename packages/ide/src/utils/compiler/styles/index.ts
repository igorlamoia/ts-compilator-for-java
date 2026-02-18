import { TerminalLine } from "@/components/terminal";

const ARITHMETICS = {
  text: "text-yellow-500",
  bg: "bg-yellow-100 dark:bg-amber-900/55",
  border: "border-yellow-500",
  transform: "hover:bg-yellow-200",
};

const ASSIGNMENTS = {
  text: "text-yellow-600",
  bg: "bg-yellow-200 dark:bg-amber-900/60",
  border: "border-yellow-600",
  transform: "hover:bg-yellow-300",
};

const LITERALS = {
  text: "text-red-500",
  bg: "bg-red-100 dark:bg-rose-900/55",
  border: "border-red-500",
  transform: "hover:bg-red-200",
};

const LOGICALS = {
  text: "text-yellow-500",
  bg: "bg-yellow-100 dark:bg-amber-900/55",
  border: "border-yellow-500",
  transform: "hover:bg-yellow-200",
};

const RELATIONALS = {
  text: "text-yellow-500",
  bg: "bg-yellow-100 dark:bg-amber-900/55",
  border: "border-yellow-500",
  transform: "hover:bg-yellow-200",
};

const RESERVEDS = {
  text: "text-blue-500",
  bg: "bg-blue-100 dark:bg-sky-900/55",
  border: "border-blue-500",
  transform: "hover:bg-blue-200",
};

const IDENTIFIERS = {
  text: "text-purple-500",
  bg: "bg-purple-100 dark:bg-fuchsia-900/55",
  border: "border-purple-500",
  transform: "hover:bg-purple-200",
};

const COMMENTS = {
  text: "text-gray-500",
  bg: "bg-gray-100 dark:bg-slate-800/60",
  border: "border-gray-500",
  transform: "hover:bg-gray-200",
};

const ERRORS = {
  text: "text-red-500",
  bg: "bg-red-100 dark:bg-rose-900/55",
  border: "border-red-500",
  transform: "hover:bg-red-200",
};

const DEFAULT = {
  text: "text-gray-500",
  bg: "bg-gray-100 dark:bg-slate-800/60",
  border: "border-gray-500",
  transform: "hover:bg-gray-200",
};

export const COLORS = {
  ARITHMETICS,
  ASSIGNMENTS,
  LITERALS,
  LOGICALS,
  RELATIONALS,
  RESERVEDS,
  IDENTIFIERS,
  COMMENTS,
  ERRORS,
  DEFAULT,
};

export const getLineColor = (type: TerminalLine["type"]) => {
  switch (type) {
    case "error":
      return "text-red-600/80 dark:text-red-400";
    case "success":
      return "text-green-900/80 dark:text-green-400";
    case "info":
      return "text-cyan-700/80 dark:text-(--color-primary)";
    case "input":
      return "text-cyan-700/80 dark:text-(--color-primary)";
    case "prompt":
      return "text-yellow-700/80 dark:text-yellow-400";
    default:
      return "text-gray-500 dark:text-gray-200";
  }
};

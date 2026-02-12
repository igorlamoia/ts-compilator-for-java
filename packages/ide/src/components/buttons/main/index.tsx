import React from "react";

type MainButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement>;

export function MainButton({
  children,
  className = "",
  ...props
}: MainButtonProps) {
  return (
    <button
      {...props}
      className={`${className} rounded-md
          border dark:border-slate-600 border-gray-300
          dark:bg-slate-800 bg-white
          dark:text-gray-200 text-gray-700
          hover:dark:bg-slate-700 hover:bg-gray-50
          transition-colors text-sm font-medium px-4 py-2`}
    >
      {children}
    </button>
  );
}

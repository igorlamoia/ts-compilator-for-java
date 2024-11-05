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
      className={`${className} bg-white  hover:bg-gray-100 text-gray-800 font-semibold py-2 px-4 border border-gray-400 rounded shadow`}
    >
      {children}
    </button>
  );
}

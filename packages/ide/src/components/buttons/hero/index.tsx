import React from "react";
import styles from "./style.module.css";
type HeroButtonProps = {
  start: string;
  end: string;
} & React.ButtonHTMLAttributes<HTMLButtonElement>;

export function HeroButton({
  start,
  end,
  className,
  ...rest
}: HeroButtonProps) {
  const isDisabled = !!rest.disabled;

  return (
    <div
      className={`${styles.buttons} w-max
          border dark:border-slate-600 border-gray-300
          dark:bg-slate-800 bg-white
          dark:text-gray-200 text-gray-700
          ${isDisabled ? "" : "hover:dark:bg-slate-700 hover:bg-gray-50"}
          transition-colors text-sm font-medium`}
    >
      <button
        {...rest}
        className={`w-40 h-9 ${className} ${styles.btn} disabled:cursor-not-allowed disabled:opacity-50`}
      >
        <span></span>
        <p data-start={start} data-title={start} data-text={end}></p>
      </button>
    </div>
  );
}

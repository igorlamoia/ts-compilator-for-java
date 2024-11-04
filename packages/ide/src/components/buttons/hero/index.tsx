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
  return (
    <div className={`${styles.buttons} ml-auto w-max text-white bg-black`}>
      <button {...rest} className={`w-40 h-12 ${className} ${styles.btn}`}>
        <span></span>
        <p data-start={start} data-title={start} data-text={end}></p>
      </button>
    </div>
  );
}

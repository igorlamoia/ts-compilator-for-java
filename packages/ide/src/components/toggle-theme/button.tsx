import styles from "./style.module.css";
import { cn } from "@/lib/utils";
type ButtonProps = React.ButtonHTMLAttributes<HTMLInputElement> & {
  className?: string;
  checked?: boolean;
};

export default function Button({ className, ...props }: ButtonProps) {
  return (
    <label className={styles["bb8-toggle"]}>
      <input
        className={cn(styles["bb8-toggle__checkbox"], className)}
        type="checkbox"
        {...props}
      />
      <div className={styles["bb8-toggle__container"]}>
        <div className={styles["bb8-toggle__scenery"]}>
          <div className={styles["bb8-toggle__star"]}></div>
          <div className={styles["bb8-toggle__star"]}></div>
          <div className={styles["bb8-toggle__star"]}></div>
          <div className={styles["bb8-toggle__star"]}></div>
          <div className={styles["bb8-toggle__star"]}></div>
          <div className={styles["bb8-toggle__star"]}></div>
          <div className={styles["bb8-toggle__star"]}></div>
          <div className={styles["tatto-1"]}></div>
          <div className={styles["tatto-2"]}></div>
          <div className={styles["gomrassen"]}></div>
          <div className={styles["hermes"]}></div>
          <div className={styles["chenini"]}></div>
          <div className={styles["bb8-toggle__cloud"]}></div>
          <div className={styles["bb8-toggle__cloud"]}></div>
          <div className={styles["bb8-toggle__cloud"]}></div>
        </div>
        <div className={styles["bb8"]}>
          <div className={styles["bb8__head-container"]}>
            <div className={styles["bb8__antenna"]}></div>
            <div className={styles["bb8__antenna"]}></div>
            <div className={styles["bb8__head"]}></div>
          </div>
          <div className={styles["bb8__body"]}></div>
        </div>
        <div className={styles["artificial__hidden"]}>
          <div className={styles["bb8__shadow"]}></div>
        </div>
      </div>
    </label>
  );
}

import { useTheme } from "@/contexts/ThemeContext";
import styles from "./meteores.module.scss";

export function Meteores() {
  const { darkMode } = useTheme();

  console.log(darkMode);

  const background = darkMode
    ? "radial-gradient(ellipse at bottom, #0d1d31 0%, #0c0d13 100%)"
    : "radial-gradient(ellipse at bottom, #cfddf3 0%, #ffffff 100%)";

  return (
    <div
      style={{ background }}
      className="
      flex justify-center items-center min-h-screen  overflow-hidden inset-0 fixed
      "
    >
      <div className={styles.stars}>
        <div className={styles.star}></div>
        <div className={styles.star}></div>
        <div className={styles.star}></div>
        <div className={styles.star}></div>
        <div className={styles.star}></div>
        <div className={styles.star}></div>
        <div className={styles.star}></div>
        <div className={styles.star}></div>
        <div className={styles.star}></div>
        <div className={styles.star}></div>
        <div className={styles.star}></div>
        <div className={styles.star}></div>
      </div>
    </div>
  );
}

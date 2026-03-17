import React from "react";
import styles from "./Spinner.module.css";

const Spinner = ({
  size = "md",
  label = "Loading...",
  inline = false,
  className = "",
  spinnerClassName = "",
}) => {
  const wrapperClasses = [
    inline ? styles.inlineWrapper : styles.wrapper,
    className,
  ]
    .filter(Boolean)
    .join(" ");

  const spinnerClasses = [styles.spinner, styles[size], spinnerClassName]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={wrapperClasses} role="status" aria-live="polite">
      <span className={spinnerClasses} />
      {label && <span className={styles.label}>{label}</span>}
    </div>
  );
};

export default Spinner;

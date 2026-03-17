import React from "react";
import styles from "./Switch.module.css";

const Switch = ({
  label,
  checked,
  onChange,
  error,
  helperText,
  disabled = false,
  className = "",
  ...props
}) => {
  const wrapperClasses = [styles.wrapper, className].filter(Boolean).join(" ");

  const inputProps = {
    type: "checkbox",
    className: styles.input,
    onChange,
    disabled,
    ...props,
  };

  if (checked !== undefined) {
    inputProps.checked = checked;
  }

  return (
    <div className={wrapperClasses}>
      <label className={styles.switchRow}>
        {label && <span className={styles.label}>{label}</span>}
        <span className={styles.switch}>
          <input {...inputProps} />
          <span
            className={`${styles.slider} ${disabled ? styles.disabled : ""}`}
          />
        </span>
      </label>
      {error ? (
        <span className={styles.errorText}>{error}</span>
      ) : (
        helperText && <span className={styles.helperText}>{helperText}</span>
      )}
    </div>
  );
};

export default Switch;

import React from "react";
import styles from "./Input.module.css";

const Input = ({
  label,
  type = "text",
  placeholder,
  value,
  onChange,
  error,
  helperText,
  required = false,
  disabled = false,
  fullWidth = false,
  className = "",
  icon,
  rightElement,
  onClick,
  maxLength = 30,
  ...props
}) => {
  const inputClasses = [
    styles.input,
    error && styles.error,
    disabled && styles.disabled,
    icon && styles.withIcon,
    rightElement && styles.withRightElement,
    fullWidth && styles.fullWidth,
  ]
    .filter(Boolean)
    .join(" ");

  const handleClick = (e) => {
    if (["date", "month", "week", "time", "datetime-local"].includes(type)) {
      try {
        e.target.showPicker();
      } catch (error) {
        console.log("Picker not supported");
      }
    }
    if (onClick) onClick(e);
  };

  return (
    <div
      className={`${styles.inputWrapper} ${fullWidth ? styles.fullWidth : ""} ${className}`}
    >
      {label && (
        <label className={styles.label}>
          {label}
          {required && <span className={styles.required}>*</span>}
        </label>
      )}
      <div className={styles.inputContainer}>
        {icon && <span className={styles.icon}>{icon}</span>}
        <input
          type={type}
          className={inputClasses}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          disabled={disabled}
          required={required}
          onClick={handleClick}
          maxLength={maxLength}
          {...props}
        />
        {rightElement && (
          <div className={styles.rightElement}>{rightElement}</div>
        )}
      </div>
      {(error || helperText) && (
        <div className={styles.footer}>
          {error ? (
            <span className={styles.errorText}>{error}</span>
          ) : helperText ? (
            <span className={styles.helperText}>{helperText}</span>
          ) : null}
        </div>
      )}
    </div>
  );
};

export default Input;

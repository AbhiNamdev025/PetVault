import React from "react";
import styles from "./Textarea.module.css";

const Textarea = ({
  label,
  placeholder,
  value,
  onChange,
  error,
  helperText,
  required = false,
  disabled = false,
  fullWidth = false,
  rows = 4,
  className = "",
  maxLength = 200,
  ...props
}) => {
  const textareaClasses = [
    styles.textarea,
    error && styles.error,
    disabled && styles.disabled,
    fullWidth && styles.fullWidth,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div
      className={`${styles.textareaWrapper} ${fullWidth ? styles.fullWidth : ""} ${className}`}
    >
      {label && (
        <label className={styles.label}>
          {label}
          {required && <span className={styles.required}>*</span>}
        </label>
      )}
      <textarea
        className={textareaClasses}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        disabled={disabled}
        required={required}
        rows={rows}
        maxLength={maxLength}
        {...props}
      />
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

export default Textarea;

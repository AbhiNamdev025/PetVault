import React from "react";
import styles from "./Radio.module.css";

const Radio = ({
  label,
  checked,
  onChange,
  error,
  helperText,
  required = false,
  disabled = false,
  className = "",
  inputClassName = "",
  ...props
}) => {
  const wrapperClasses = [styles.wrapper, className].filter(Boolean).join(" ");
  const controlClasses = [
    styles.control,
    error && styles.error,
    disabled && styles.disabled,
    inputClassName,
  ]
    .filter(Boolean)
    .join(" ");

  const inputProps = {
    type: "radio",
    className: controlClasses,
    onChange,
    disabled,
    required,
    ...props,
  };

  if (checked !== undefined) {
    inputProps.checked = checked;
  }

  return (
    <div className={wrapperClasses}>
      <label className={styles.label}>
        <input {...inputProps} />
        {label && (
          <span className={styles.labelText}>
            {label}
            {required && <span className={styles.required}>*</span>}
          </span>
        )}
      </label>
      {error ? (
        <span className={styles.errorText}>{error}</span>
      ) : (
        helperText && <span className={styles.helperText}>{helperText}</span>
      )}
    </div>
  );
};

export default Radio;

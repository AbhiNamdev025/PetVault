import React, { useState, useRef, useEffect } from "react";
import styles from "./Select.module.css";

const Select = ({
  label,
  options = [],
  value,
  onChange,
  error,
  helperText,
  required = false,
  disabled = false,
  fullWidth = false,
  placeholder = "Select an option",
  className = "",
  icon,
  name
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const handleSelect = (option) => {
    const optionValue = option.value !== undefined ? option.value : option;

    // mimic native event object
    const fakeEvent = {
      target: {
        name: name,
        value: optionValue,
      },
    };

    if (onChange) {
      onChange(fakeEvent);
    }
    setIsOpen(false);
  };

  const selectedOption = options.find((opt) => {
    const optValue = opt.value !== undefined ? opt.value : opt;
    return optValue === value;
  });

  const displayValue = selectedOption
    ? selectedOption.label || selectedOption
    : "";

  const toggleDropdown = () => {
    if (!disabled) {
      setIsOpen(!isOpen);
    }
  };

  const wrapperClasses = [
    styles.selectWrapper,
    fullWidth && styles.fullWidth,
    className,
  ]
    .filter(Boolean)
    .join(" ");

  const triggerClasses = [
    styles.selectTrigger,
    icon && styles.withIcon,
    isOpen && styles.isOpen,
    error && styles.error,
    disabled && styles.disabled,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={wrapperClasses} ref={dropdownRef}>
      {label && (
        <label className={styles.label}>
          {label}
          {required && <span className={styles.required}>*</span>}
        </label>
      )}

      <div className={styles.selectControl}>
        <div className={triggerClasses} onClick={toggleDropdown}>
          {icon && <span className={styles.icon}>{icon}</span>}

          <span
            className={`${styles.triggerContent} ${
              !displayValue ? styles.placeholder : ""
            }`}
          >
            {displayValue || placeholder}
          </span>

          <span className={styles.arrow}>▼</span>
        </div>

        {isOpen && (
          <div className={styles.dropdownMenu}>
            {options.length > 0 ? (
              options.map((option, index) => {
                const optValue =
                  option.value !== undefined ? option.value : option;
                const optLabel =
                  option.label !== undefined ? option.label : option;
                const isSelected = optValue === value;

                return (
                  <div
                    key={index}
                    className={`${styles.optionItem} ${
                      isSelected ? styles.selected : ""
                    }`}
                    onClick={() => handleSelect(option)}
                  >
                    {optLabel}
                    {isSelected && (
                      <span
                        style={{
                          marginLeft: "auto",
                          color: "var(--color-primary-600)",
                        }}
                      >
                        ✓
                      </span>
                    )}
                  </div>
                );
              })
            ) : (
              <div
                className={styles.optionItem}
                style={{
                  justifyContent: "center",
                  color: "#9ca3af",
                  cursor: "default",
                }}
              >
                No options
              </div>
            )}
          </div>
        )}
      </div>

      {error && <span className={styles.errorText}>{error}</span>}
      {helperText && !error && (
        <span className={styles.helperText}>{helperText}</span>
      )}
    </div>
  );
};

export default Select;

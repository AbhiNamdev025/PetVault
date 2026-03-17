import React from "react";
import styles from "./Button.module.css";

const Button = React.forwardRef(
  (
    {
      as = "button",
      children,
      variant = "primary",
      size = "md",
      usePresetStyle,
      fullWidth = false,
      disabled = false,
      type,
      href,
      target,
      rel,
      onClick,
      className = "",
      style,
      isLoading = false,
      icon,
      leftIcon,
      rightIcon,
      loadingText,
      ...props
    },
    ref,
  ) => {
    const resolvedType = type ?? "button";
    const shouldUsePresetStyle = usePresetStyle ?? true;
    const isButtonElement = as === "button";
    const isDisabled = disabled || isLoading;

    const classes = [
      styles.button,
      shouldUsePresetStyle && styles.preset,
      shouldUsePresetStyle && styles[variant],
      shouldUsePresetStyle && styles[size],
      fullWidth && styles.fullWidth,
      isDisabled && styles.disabled,
      isLoading && styles.loading,
      className,
    ]
      .filter(Boolean)
      .join(" ");

    const componentProps = {
      ref,
      className: classes,
      onClick,
      style: {
        ...(style || {}),
        borderRadius: "var(--ui-button-radius, var(--radius-lg))",
      },
      ...props,
    };

    if (isButtonElement) {
      componentProps.type = resolvedType;
      componentProps.disabled = isDisabled;
    } else {
      if (href) componentProps.href = href;
      if (target) componentProps.target = target;
      componentProps.rel =
        rel ?? (target === "_blank" ? "noopener noreferrer" : undefined);

      if (isDisabled) {
        componentProps["aria-disabled"] = true;
        componentProps.tabIndex = -1;
        componentProps.onClick = (event) => {
          event.preventDefault();
        };
      }
    }

    const content = isLoading ? (
      <>
        <div className={styles.spinner}></div>
        {loadingText && <span>{loadingText}</span>}
      </>
    ) : (
      <>
        {(leftIcon || icon) && (
          <span className={styles.icon}>{leftIcon || icon}</span>
        )}
        {children}
        {rightIcon && <span className={styles.icon}>{rightIcon}</span>}
      </>
    );

    return React.createElement(as, componentProps, content);
  },
);

Button.displayName = "Button";

export default Button;

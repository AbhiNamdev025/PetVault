import React from "react";
import styles from "./Badge.module.css";

const Badge = ({
  children,
  variant = "primary",
  size = "md",
  icon,
  endIcon,
  className = "",
  ...props
}) => {
  const badgeClasses = [styles.badge, styles[variant], styles[size], className]
    .filter(Boolean)
    .join(" ");

  return (
    <span className={badgeClasses} {...props}>
      {icon && <span>{icon}</span>}
      {children}
      {endIcon && <span>{endIcon}</span>}
    </span>
  );
};

export default Badge;

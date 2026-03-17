import React from "react";
import styles from "./EmptyState.module.css";

const EmptyState = ({
  icon,
  title,
  description,
  action,
  compact = false,
  className = "",
}) => {
  const classes = [styles.emptyState, compact && styles.compact, className]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={classes}>
      {icon && <div className={styles.icon}>{icon}</div>}
      {title && <h3 className={styles.title}>{title}</h3>}
      {description && <p className={styles.description}>{description}</p>}
      {action && <div className={styles.action}>{action}</div>}
    </div>
  );
};

export default EmptyState;

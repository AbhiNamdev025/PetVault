import React, { useMemo, useState } from "react";
import styles from "./Avatar.module.css";

const sizeClassMap = {
  xs: styles.xs,
  sm: styles.sm,
  md: styles.md,
  lg: styles.lg,
  xl: styles.xl,
};

const Avatar = ({
  src,
  alt = "avatar",
  name = "",
  size = "md",
  status,
  className = "",
  ...props
}) => {
  const [hasError, setHasError] = useState(false);

  const initials = useMemo(() => {
    if (!name) return "?";
    const parts = name
      .trim()
      .split(" ")
      .filter(Boolean);
    if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
    return `${parts[0].charAt(0)}${parts[1].charAt(0)}`.toUpperCase();
  }, [name]);

  const avatarClasses = [
    styles.avatar,
    sizeClassMap[size] || styles.md,
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={avatarClasses} {...props}>
      {src && !hasError ? (
        <img
          src={src}
          alt={alt}
          className={styles.image}
          onError={() => setHasError(true)}
        />
      ) : (
        <span className={styles.initials}>{initials}</span>
      )}
      {status && (
        <span
          className={`${styles.statusDot} ${styles[`status-${status}`] || ""}`}
        />
      )}
    </div>
  );
};

export default Avatar;

import React from "react";
import styles from "./PageContainer.module.css";

const PageContainer = ({
  as = "section",
  children,
  width = "xl",
  padded = true,
  surface = false,
  gap = "md",
  className = "",
  ...props
}) => {
  const Component = as;
  const classes = [
    styles.container,
    styles[width] || styles.lg,
    padded && styles.padded,
    surface && styles.surface,
    styles[`gap-${gap}`] || styles["gap-md"],
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <Component className={classes} {...props}>
      {children}
    </Component>
  );
};

export default PageContainer;

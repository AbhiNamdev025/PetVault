import React from "react";
import styles from "./SectionHeader.module.css";

const headingByLevel = {
  page: "h1",
  section: "h2",
  subsection: "h3",
};

const SectionHeader = ({
  icon,
  title,
  subtitle,
  count,
  actions,
  align = "left",
  level = "section",
  tone = "default",
  titleClassName = "",
  subtitleClassName = "",
  contentClassName = "",
  className = "",
}) => {
  const HeaderTag = headingByLevel[level] || "h2";

  const classes = [
    styles.header,
    styles[level],
    styles[align],
    styles[tone],
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={classes}>
      <div className={[styles.content, contentClassName].filter(Boolean).join(" ")}>
        {(icon || title) && (
          <div className={styles.titleRow}>
            {icon && <span className={styles.icon}>{icon}</span>}
            {title && (
              <HeaderTag
                className={[titleClassName, styles.title].filter(Boolean).join(" ")}
              >
                {title}
              </HeaderTag>
            )}
            {typeof count === "number" && (
              <span className={styles.count}>({count})</span>
            )}
          </div>
        )}
        {subtitle && (
          <p
            className={[subtitleClassName, styles.subtitle]
              .filter(Boolean)
              .join(" ")}
          >
            {subtitle}
          </p>
        )}
      </div>
      {actions && <div className={styles.actions}>{actions}</div>}
    </div>
  );
};

export default SectionHeader;

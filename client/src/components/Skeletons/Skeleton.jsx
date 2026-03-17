import React from "react";
import styles from "./Skeleton.module.css";

/**
 * Base Skeleton component with shimmer animation
 * @param {string} variant - 'text', 'circular', 'rectangular', 'rounded'
 * @param {string|number} width - Width of skeleton
 * @param {string|number} height - Height of skeleton
 * @param {string} className - Additional CSS class
 * @param {object} style - Inline styles
 */
const Skeleton = ({
  variant = "text",
  width,
  height,
  className = "",
  style = {},
  animation = "shimmer",
}) => {
  const getVariantClass = () => {
    switch (variant) {
      case "circular":
        return styles.circular;
      case "rectangular":
        return styles.rectangular;
      case "rounded":
        return styles.rounded;
      case "text":
      default:
        return styles.text;
    }
  };

  const getAnimationClass = () => {
    switch (animation) {
      case "pulse":
        return styles.pulse;
      case "wave":
        return styles.wave;
      case "shimmer":
      default:
        return styles.shimmer;
    }
  };

  const inlineStyles = {
    width: width || (variant === "circular" ? height : "100%"),
    height: height || (variant === "text" ? "1em" : undefined),
    ...style,
  };

  return (
    <div
      className={`${styles.skeleton} ${getVariantClass()} ${getAnimationClass()} ${className}`}
      style={inlineStyles}
    />
  );
};

export default Skeleton;

import React from "react";
import styles from "./Card.module.css";

const Card = ({
  children,
  variant = "default",
  padding = "md",
  hover = false,
  className = "",
  onClick,
  as,
  type = "button",
  ...props
}) => {
  const cardClasses = [
    styles.card,
    styles[variant],
    styles[`padding-${padding}`],
    hover && styles.hover,
    onClick && styles.clickable,
    className,
  ]
    .filter(Boolean)
    .join(" ");

  const Component = as || (onClick ? "button" : "div");

  const componentProps = {
    className: cardClasses,
    onClick,
    ...props,
  };

  if (Component === "button") {
    componentProps.type = type;
  }

  return (
    <Component {...componentProps}>{children}</Component>
  );
};

export default Card;

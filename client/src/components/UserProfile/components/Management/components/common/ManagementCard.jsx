import React from "react";
import styles from "./ManagementCardTheme.module.css";

const ManagementCard = ({
  image,
  title,
  subtitle,
  price,
  badge,
  badgeVariant = "default",
  actions,
  extraInfo,
  isInactive = false,
  overlay,
  onClick,
  className = "",
}) => {
  const hasThreeActions = actions && actions.length === 3;

  return (
    <div
      className={`${styles.managementCard} ${isInactive ? styles.cardInactive : ""} ${className}`}
      onClick={onClick}
      style={onClick ? { cursor: "pointer" } : undefined}
    >
      <div className={styles.managementImageBox}>
        {image ? (
          <img src={image} alt={title} className={styles.managementImage} />
        ) : (
          <div className={styles.managementNoImage}>No Image</div>
        )}
        {overlay}
      </div>

      <div className={styles.managementInfo}>
        <div className={styles.managementTitleRow}>
          <h3 className={styles.managementName}>{title}</h3>
          {subtitle && <p className={styles.managementBrand}>{subtitle}</p>}
        </div>

        <div className={styles.managementPriceRow}>
          {price && <p className={styles.managementPrice}>{price}</p>}
          {badge && (
            <span
              className={`${styles.managementStockBadge} ${
                badgeVariant === "danger" ? styles.managementBadgeDanger : ""
              } ${badgeVariant === "success" ? styles.managementBadgeSuccess : ""}`}
            >
              {badge}
            </span>
          )}
        </div>

        {extraInfo}
      </div>

      {actions && (
        <div
          className={`${styles.managementActions} ${
            hasThreeActions ? styles.managementActionsThree : ""
          }`}
          onClick={(e) => e.stopPropagation()}
        >
          {actions}
        </div>
      )}
    </div>
  );
};

export default ManagementCard;

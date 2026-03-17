import React, { useMemo, useState } from "react";
import Card from "../Card/Card";
import Button from "../Button/Button";
import styles from "./ListingCard.module.css";

const isObjectLike = (value) =>
  value !== null && typeof value === "object" && !React.isValidElement(value);

const ListingCard = ({
  onClick,
  imageSrc,
  fallbackImageSrc = "",
  imageAlt = "",
  noImageLabel = "No Image",
  imageFit = "contain",
  overlayText = "View Details",
  badges = [],
  title,
  titleIcon,
  titleNoWrap = false,
  headerRight,
  subtitle,
  context,
  metaItems = [],
  description,
  footer,
  className = "",
  imageContainerClassName = "",
  contentClassName = "",
  footerClassName = "",
  interactive = true,
  ...props
}) => {
  const [imageHasError, setImageHasError] = useState(false);
  const resolvedImageSrc = useMemo(() => {
    if (!imageHasError) return imageSrc || fallbackImageSrc || "";
    return fallbackImageSrc || "";
  }, [imageSrc, fallbackImageSrc, imageHasError]);

  const hasImage = Boolean(resolvedImageSrc);
  const clickable = interactive && typeof onClick === "function";

  const handleImageError = () => {
    setImageHasError(true);
  };

  const cardClasses = [styles.card, className].filter(Boolean).join(" ");
  const imageClasses = [
    styles.image,
    imageFit === "cover" ? styles.cover : styles.contain,
  ]
    .filter(Boolean)
    .join(" ");
  const imageWrapClasses = [styles.imageContainer, imageContainerClassName]
    .filter(Boolean)
    .join(" ");
  const contentClasses = [styles.content, contentClassName]
    .filter(Boolean)
    .join(" ");

  const renderMetaItem = (item, index) => {
    if (React.isValidElement(item)) {
      return (
        <div key={index} className={styles.metaItem}>
          {item}
        </div>
      );
    }
    if (!isObjectLike(item)) {
      return (
        <div key={index} className={styles.metaItem}>
          {item}
        </div>
      );
    }

    const {
      icon,
      label,
      onItemClick,
      itemClassName = "",
      textClassName = "",
      tone = "",
      disabled = false,
    } = item;

    const toneClass = tone ? styles[`tone-${tone}`] : "";

    if (onItemClick) {
      return (
        <Button
          key={index}
          type="button"
          className={[
            styles.metaItem,
            styles.metaButton,
            toneClass,
            itemClassName,
          ]
            .filter(Boolean)
            .join(" ")}
          onClick={(e) => {
            e.stopPropagation();
            if (!disabled) onItemClick(e);
          }}
          disabled={disabled}
          variant="ghost"
          size="sm"
          leftIcon={icon && <span className={styles.metaIcon}>{icon}</span>}
        >
          <span className={textClassName}>{label}</span>
        </Button>
      );
    }

    return (
      <div
        key={index}
        className={[styles.metaItem, toneClass, itemClassName]
          .filter(Boolean)
          .join(" ")}
      >
        {icon && <span className={styles.metaIcon}>{icon}</span>}
        <span className={textClassName}>{label}</span>
      </div>
    );
  };

  return (
    <Card
      onClick={clickable ? onClick : undefined}
      padding="none"
      hover={clickable}
      className={cardClasses}
      {...props}
    >
      <div className={imageWrapClasses}>
        {hasImage ? (
          <img
            src={resolvedImageSrc}
            alt={imageAlt}
            className={imageClasses}
            onError={handleImageError}
          />
        ) : (
          <div className={styles.noImage}>{noImageLabel}</div>
        )}

        {clickable && overlayText && (
          <div className={styles.overlay}>{overlayText}</div>
        )}

        {Array.isArray(badges) &&
          badges.map((badge, index) => {
            if (!badge?.content) return null;
            const position = badge.position || "top-right";
            const positionClass =
              styles[position.replace("-", "")] || styles.topright;

            return (
              <div
                key={`${position}-${index}`}
                className={[styles.badgeSlot, positionClass, badge.className]
                  .filter(Boolean)
                  .join(" ")}
              >
                {badge.content}
              </div>
            );
          })}
      </div>

      <div className={contentClasses}>
        {(title || headerRight) && (
          <div className={styles.headerRow}>
            <div className={styles.titleWrap}>
              {(titleIcon || title) && (
                <h3
                  className={[styles.title, titleNoWrap && styles.titleNoWrap]
                    .filter(Boolean)
                    .join(" ")}
                >
                  {titleIcon && (
                    <span className={styles.titleIcon}>{titleIcon}</span>
                  )}
                  <span>{title}</span>
                </h3>
              )}
            </div>
            {headerRight && (
              <div
                className={styles.headerRight}
                onClick={(e) => e.stopPropagation()}
              >
                {headerRight}
              </div>
            )}
          </div>
        )}

        {(subtitle || context) && (
          <div className={styles.subContextRow}>
            {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
            {context && <div className={styles.contextRow}>{context}</div>}
          </div>
        )}

        {metaItems.length > 0 && (
          <div className={styles.metaGrid}>
            {metaItems.map((item, index) => renderMetaItem(item, index))}
          </div>
        )}

        {description &&
          (React.isValidElement(description) ? (
            <div className={styles.description}>{description}</div>
          ) : (
            <p className={styles.description}>{description}</p>
          ))}
      </div>

      {footer && (
        <div
          className={[styles.footer, footerClassName].filter(Boolean).join(" ")}
          onClick={(e) => e.stopPropagation()}
        >
          {footer}
        </div>
      )}
    </Card>
  );
};
export default ListingCard;

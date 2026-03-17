import React from "react";
import { ArrowLeft } from "lucide-react";
import Button from "../Button/Button";
import styles from "./DetailLayout.module.css";

const joinClasses = (...classes) => classes.filter(Boolean).join(" ");

export const DetailPage = ({ children, className = "" }) => (
  <div className={joinClasses(styles.page, className)}>
    <div className={styles.container}>{children}</div>
  </div>
);

export const DetailBackButton = ({ onClick, label = "Back", className = "" }) => (
  <Button
    className={joinClasses(styles.backButton, className)}
    onClick={onClick}
    variant="ghost"
    size="sm"
  >
    <ArrowLeft size={18} />
    <span>{label}</span>
  </Button>
);

export const DetailSplitCard = ({ gallery, content, className = "" }) => (
  <div className={joinClasses(styles.splitCard, className)}>
    <div className={styles.galleryColumn}>{gallery}</div>
    <div className={styles.contentColumn}>{content}</div>
  </div>
);

export const DetailMediaGallery = ({
  images = [],
  selectedIndex = 0,
  onSelect,
  fallbackSrc,
  alt = "detail image",
  objectFit = "cover",
  thumbObjectFit = objectFit,
  className = "",
}) => {
  const safeImages = Array.isArray(images) ? images.filter(Boolean) : [];
  const hasImages = safeImages.length > 0;
  const safeIndex = hasImages
    ? Math.min(Math.max(selectedIndex, 0), safeImages.length - 1)
    : 0;
  const mainSrc = hasImages ? safeImages[safeIndex] : fallbackSrc;

  return (
    <div className={joinClasses(styles.gallery, className)}>
      <img
        className={styles.mainImage}
        src={mainSrc || fallbackSrc}
        alt={alt}
        style={{ objectFit }}
      />

      {hasImages && safeImages.length > 1 && (
        <div className={styles.thumbnailRow}>
          {safeImages.map((src, index) => (
            <img
              key={`${src}-${index}`}
              src={src}
              alt={`${alt} ${index + 1}`}
              className={joinClasses(
                styles.thumbnail,
                index === safeIndex && styles.thumbnailActive,
              )}
              style={{ objectFit: thumbObjectFit }}
              onClick={() => onSelect?.(index)}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export const DetailEntityCard = ({
  avatarSrc,
  avatarAlt,
  title,
  subtitle,
  badges = [],
  ctaText = "View Details",
  onClick,
  className = "",
  avatarFit = "cover",
}) => {
  const handleKeyDown = (event) => {
    if (!onClick) return;
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      onClick();
    }
  };

  return (
    <div
      className={joinClasses(
        styles.entityCard,
        onClick && styles.entityCardInteractive,
        className,
      )}
      onClick={onClick}
      onKeyDown={handleKeyDown}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
    >
      <img
        className={styles.entityAvatar}
        src={avatarSrc}
        alt={avatarAlt || title || "provider"}
        style={{ objectFit: avatarFit }}
      />

      <div className={styles.entityBody}>
        <h3 className={styles.entityTitle}>{title}</h3>
        {subtitle && <p className={styles.entitySubtitle}>{subtitle}</p>}

        {badges.length > 0 && (
          <div className={styles.entityBadges}>
            {badges.map((badge) => (
              <span key={badge} className={styles.entityBadge}>
                {badge}
              </span>
            ))}
          </div>
        )}
      </div>

      <span className={styles.entityCta}>{ctaText}</span>
    </div>
  );
};


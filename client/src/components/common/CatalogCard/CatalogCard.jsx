import React from "react";
import { Star } from "lucide-react";
import Badge from "../Badge/Badge";
import Button from "../Button/Button";
import ListingCard from "../ListingCard/ListingCard";
import styles from "./CatalogCard.module.css";

const CatalogCard = ({
  onClick,
  imageSrc,
  fallbackImageSrc = "",
  imageAlt = "",
  noImageLabel = "No Image",
  topBadges = [],
  title,
  subtitle,
  ownerLabel,
  ownerIcon,
  onOwnerClick,
  priceLabel,
  contextLabel,
  rating,
  supportingLabel,
  supportingTone = "neutral",
  metaItems = [],
  actionLabel,
  actionIcon,
  onAction,
  actionDisabled = false,
  actionContent = null,
  overlayText = "View Details",
}) => {
  const ownerChip = ownerLabel ? (
    <Button
      type="button"
      className={styles.ownerChip}
      onClick={(e) => {
        if (!onOwnerClick) return;
        e.stopPropagation();
        onOwnerClick(e);
      }}
      disabled={!onOwnerClick}
      variant="ghost"
      size="sm"
    >
      {ownerIcon && <span className={styles.ownerIcon}>{ownerIcon}</span>}
      <span className={styles.ownerText}>{ownerLabel}</span>
    </Button>
  ) : null;

  const contextContent =
    priceLabel || contextLabel ? (
      <div className={styles.contextGroup}>
        {priceLabel && (
          <Badge variant="primary-soft" size="sm" className={styles.priceBadge}>
            {priceLabel}
          </Badge>
        )}
        {contextLabel && (
          <span className={styles.contextPill}>{contextLabel}</span>
        )}
      </div>
    ) : null;

  const ratingContent =
    rating !== null && rating !== undefined ? (
      <div className={styles.ratingRow}>
        <div className={styles.stars}>
          {Array.from({ length: 5 }, (_, i) => (
            <Star
              key={i}
              size={14}
              fill={i < Math.floor(Number(rating) || 0) ? "#facc15" : "none"}
              stroke="#facc15"
            />
          ))}
        </div>
        <span className={styles.ratingValue}>
          {(Number(rating) || 0).toFixed(1)}
        </span>
      </div>
    ) : null;

  const supportingContent =
    ratingContent ||
    (supportingLabel ? (
      <span
        className={[styles.supportingText, styles[`tone-${supportingTone}`]]
          .filter(Boolean)
          .join(" ")}
      >
        {supportingLabel}
      </span>
    ) : null);

  return (
    <ListingCard
      onClick={onClick}
      imageSrc={imageSrc}
      fallbackImageSrc={fallbackImageSrc}
      imageAlt={imageAlt}
      noImageLabel={noImageLabel}
      overlayText={overlayText}
      badges={topBadges}
      title={title}
      subtitle={subtitle}
      headerRight={ownerChip}
      context={contextContent}
      description={supportingContent}
      metaItems={metaItems}
      footer={
        actionContent ? (
          actionContent
        ) : actionLabel ? (
          <Button
            fullWidth
            size="sm"
            leftIcon={actionIcon}
            onClick={(e) => {
              if (!onAction) return;
              e.stopPropagation();
              onAction(e);
            }}
            disabled={actionDisabled}
          >
            {actionLabel}
          </Button>
        ) : null
      }
      as="div"
    />
  );
};

export default CatalogCard;

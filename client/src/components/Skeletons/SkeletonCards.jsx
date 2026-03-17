import React from "react";
import Skeleton from "./Skeleton";
import styles from "./SkeletonCards.module.css";

/**
 * Skeleton loader for Pet/Product Card
 */
export const CardSkeleton = ({ count = 1 }) => {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className={styles.cardSkeleton}>
          <Skeleton
            variant="rounded"
            height={200}
            className={styles.cardImage}
          />
          <div className={styles.cardContent}>
            <Skeleton variant="text" width="70%" height={24} />
            <Skeleton variant="text" width="50%" height={18} />
            <div className={styles.cardTags}>
              <Skeleton variant="rounded" width={60} height={24} />
              <Skeleton variant="rounded" width={60} height={24} />
            </div>
            <div className={styles.cardFooter}>
              <Skeleton variant="text" width="40%" height={28} />
              <Skeleton variant="rounded" width={100} height={36} />
            </div>
          </div>
        </div>
      ))}
    </>
  );
};

/**
 * Skeleton loader for Pet/Product Grid
 */
export const GridSkeleton = ({ count = 6, columns = 3 }) => {
  return (
    <div className={styles.gridSkeleton} style={{ "--columns": columns }}>
      <CardSkeleton count={count} />
    </div>
  );
};

/**
 * Skeleton loader for Pet/Product Details page
 */
export const DetailsSkeleton = () => {
  return (
    <div className={styles.detailsSkeleton}>
      {/* Back button */}
      <Skeleton variant="rounded" width={100} height={40} />

      <div className={styles.detailsMain}>
        {/* Gallery */}
        <div className={styles.detailsGallery}>
          <Skeleton
            variant="rounded"
            height={450}
            className={styles.mainImage}
          />
          <div className={styles.thumbnails}>
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} variant="rounded" width={100} height={100} />
            ))}
          </div>
        </div>

        {/* Info */}
        <div className={styles.detailsInfo}>
          <div className={styles.detailsHeader}>
            <div>
              <Skeleton variant="text" width="60%" height={40} />
              <Skeleton variant="text" width="40%" height={24} />
            </div>
            <div className={styles.priceBox}>
              <Skeleton variant="text" width={120} height={40} />
              <Skeleton variant="rounded" width={100} height={32} />
            </div>
          </div>

          <div className={styles.tags}>
            <Skeleton variant="rounded" width={80} height={32} />
            <Skeleton variant="rounded" width={100} height={32} />
            <Skeleton variant="rounded" width={70} height={32} />
          </div>

          {/* Accordion sections */}
          <div className={styles.accordion}>
            <Skeleton variant="rounded" height={60} />
          </div>
          <div className={styles.accordion}>
            <Skeleton variant="rounded" height={150} />
          </div>

          {/* Actions */}
          <div className={styles.actions}>
            <Skeleton variant="rounded" width="45%" height={56} />
            <Skeleton variant="rounded" width="45%" height={56} />
          </div>
        </div>
      </div>

      {/* Shop Card */}
      <div className={styles.shopCardSkeleton}>
        <Skeleton variant="rounded" width={100} height={100} />
        <div className={styles.shopInfo}>
          <Skeleton variant="text" width="60%" height={24} />
          <Skeleton variant="text" width="80%" height={16} />
          <div className={styles.shopTags}>
            <Skeleton variant="rounded" width={80} height={24} />
            <Skeleton variant="rounded" width={100} height={24} />
          </div>
        </div>
        <Skeleton variant="text" width={100} height={20} />
      </div>
    </div>
  );
};

/**
 * Skeleton loader for Profile page
 */
export const ProfileSkeleton = () => {
  return (
    <div className={styles.profileSkeleton}>
      {/* Avatar */}
      <div className={styles.profileHeader}>
        <Skeleton variant="circular" width={120} height={120} />
        <div className={styles.profileInfo}>
          <Skeleton variant="text" width={200} height={32} />
          <Skeleton variant="text" width={150} height={20} />
          <Skeleton variant="text" width={180} height={18} />
        </div>
      </div>

      {/* Stats */}
      <div className={styles.profileStats}>
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} variant="rounded" height={80} />
        ))}
      </div>

      {/* Content sections */}
      <div className={styles.profileContent}>
        <Skeleton variant="rounded" height={200} />
        <Skeleton variant="rounded" height={150} />
      </div>
    </div>
  );
};

/**
 * Skeleton loader for Management/Dashboard cards
 */
export const ManagementCardSkeleton = ({ count = 6 }) => {
  return (
    <div className={styles.managementGrid}>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className={styles.managementCard}>
          <Skeleton
            variant="rounded"
            height={150}
            className={styles.mgmtImage}
          />
          <div className={styles.mgmtContent}>
            <Skeleton variant="text" width="70%" height={20} />
            <Skeleton variant="text" width="50%" height={16} />
            <div className={styles.mgmtFooter}>
              <Skeleton variant="text" width="40%" height={24} />
              <Skeleton variant="rounded" width={32} height={32} />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

/**
 * Skeleton for My Pets cards
 */
export const PetCardSkeleton = ({ count = 4 }) => {
  return (
    <div className={styles.petCardsGrid}>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className={styles.petCardSkeleton}>
          <Skeleton
            variant="rounded"
            height={180}
            className={styles.petImage}
          />
          <div className={styles.petContent}>
            <Skeleton variant="text" width="60%" height={24} />
            <Skeleton variant="text" width="80%" height={16} />
            <div className={styles.petTags}>
              <Skeleton variant="rounded" width={60} height={24} />
              <Skeleton variant="rounded" width={70} height={24} />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

/**
 * Skeleton for Vet/Doctor Cards
 */
export const VetCardSkeleton = ({ count = 3 }) => {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className={styles.vetCardSkeleton}>
          <Skeleton
            variant="rounded"
            height={270}
            className={styles.vetImage}
          />
          <div className={styles.vetContent}>
            <Skeleton variant="text" width="70%" height={24} />
            <Skeleton variant="text" width="50%" height={18} />
            <div className={styles.vetMeta}>
              <Skeleton variant="rounded" width={80} height={20} />
              <Skeleton variant="rounded" width={100} height={20} />
            </div>
            <Skeleton
              variant="rounded"
              height={42}
              className={styles.vetButton}
            />
          </div>
        </div>
      ))}
    </>
  );
};

/**
 * Skeleton for Service Showcase Cards
 */
export const ShowcaseSkeleton = ({ count = 3 }) => {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className={styles.showcaseCardSkeleton}>
          <Skeleton
            variant="rounded"
            height={280}
            className={styles.showcaseImage}
          />
          <div className={styles.showcaseContent}>
            <div className={styles.showcaseHeader}>
              <Skeleton
                variant="rounded"
                width={52}
                height={52}
                className={styles.showcaseIcon}
              />
              <div className={styles.showcaseTitleGroup}>
                <Skeleton variant="text" width="60%" height={24} />
                <Skeleton variant="text" width="90%" height={16} />
              </div>
            </div>

            <div className={styles.showcaseList}>
              {[1, 2, 3].map((item) => (
                <div key={item} className={styles.showcaseListItem}>
                  <Skeleton variant="circular" width={16} height={16} />
                  <Skeleton variant="text" width="80%" height={14} />
                </div>
              ))}
            </div>

            <Skeleton
              variant="rounded"
              height={52}
              className={styles.showcaseButton}
            />
          </div>
        </div>
      ))}
    </>
  );
};

/**
 * Skeleton for Cart page
 */
export const CartSkeleton = () => {
  return (
    <div className={styles.cartSkeleton}>
      <Skeleton variant="text" width={200} height={32} />
      <div className={styles.cartGrid}>
        <div className={styles.cartItems}>
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className={styles.cartItemSkeleton}>
              <Skeleton variant="rounded" width={100} height={100} />
              <div className={styles.cartItemInfo}>
                <Skeleton variant="text" width="70%" height={20} />
                <Skeleton variant="text" width="40%" height={16} />
                <div className={styles.cartItemActions}>
                  <Skeleton variant="rounded" width={100} height={32} />
                  <Skeleton variant="text" width={80} height={24} />
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className={styles.cartSummary}>
          <Skeleton variant="rounded" height={250} />
        </div>
      </div>
    </div>
  );
};

/**
 * Skeleton for Dashboard pages (Admin, Analytics)
 */
export const DashboardSkeleton = ({ statsCount = 4 }) => {
  return (
    <div className={styles.dashboardSkeleton}>
      {/* Header */}
      <div className={styles.dashboardHeader}>
        <Skeleton variant="text" width={300} height={36} />
        <Skeleton variant="text" width={400} height={20} />
      </div>

      {/* Stats Grid */}
      <div className={styles.statsGrid}>
        {Array.from({ length: statsCount }).map((_, i) => (
          <div key={i} className={styles.statCardSkeleton}>
            <Skeleton variant="circular" width={48} height={48} />
            <div className={styles.statInfo}>
              <Skeleton variant="text" width={60} height={32} />
              <Skeleton variant="text" width={100} height={16} />
            </div>
          </div>
        ))}
      </div>

      {/* Chart Section */}
      <div className={styles.chartSkeleton}>
        <div className={styles.chartHeader}>
          <Skeleton variant="text" width={250} height={24} />
          <div className={styles.chartToggle}>
            <Skeleton variant="rounded" width={80} height={32} />
            <Skeleton variant="rounded" width={100} height={32} />
          </div>
        </div>
        <Skeleton variant="rounded" height={300} />
      </div>
    </div>
  );
};

/**
 * Inline text skeleton
 */
export const TextSkeleton = ({ lines = 3, widths = [] }) => {
  const defaultWidths = ["100%", "90%", "70%"];
  return (
    <div className={styles.textSkeleton}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          variant="text"
          width={widths[i] || defaultWidths[i % 3]}
          height={16}
          style={{ marginBottom: 8 }}
        />
      ))}
    </div>
  );
};

/**
 * Table row skeleton
 */
export const TableRowSkeleton = ({ columns = 5, rows = 5 }) => {
  return (
    <div className={styles.tableSkeleton}>
      {Array.from({ length: rows }).map((_, rowIdx) => (
        <div key={rowIdx} className={styles.tableRow}>
          {Array.from({ length: columns }).map((_, colIdx) => (
            <Skeleton
              key={colIdx}
              variant="text"
              height={20}
              style={{ flex: 1 }}
            />
          ))}
        </div>
      ))}
    </div>
  );
};

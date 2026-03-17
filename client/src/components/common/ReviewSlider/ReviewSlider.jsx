import React, { useEffect, useMemo, useState } from "react";
import { Star } from "lucide-react";
import styles from "./ReviewSlider.module.css";
import SectionHeader from "../SectionHeader/SectionHeader";
import { API_BASE_URL } from "../../../utils/constants";

const getProviderName = (provider = {}) => {
  if (provider.role === "caretaker") return provider.name;
  if (provider.role === "doctor")
    return provider.roleData?.doctorName || provider.name;
  return (
    provider.roleData?.daycareName ||
    provider.roleData?.hospitalName ||
    provider.roleData?.shopName ||
    provider.businessName ||
    provider.name ||
    "Pet Provider"
  );
};

const normalizeProviderList = (payload) => {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.providers)) return payload.providers;
  if (Array.isArray(payload?.results)) return payload.results;
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload?.daycares)) return payload.daycares;
  if (Array.isArray(payload?.doctors)) return payload.doctors;
  if (Array.isArray(payload?.caretakers)) return payload.caretakers;
  return [];
};

const formatDate = (value) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Recently";
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

const getInitials = (name) => {
  const parts = String(name || "")
    .trim()
    .split(/\s+/)
    .slice(0, 2);
  if (parts.length === 0) return "PP";
  return parts.map((part) => part[0]?.toUpperCase() || "").join("") || "PP";
};

const ReviewSlider = ({
  endpoints = ["/doctor"],
  icon,
  title = "What Our Pet Parents Say",
  subtitle = "Real experiences shared by verified users.",
  emptyText = "No reviews yet.",
  maxItems = 30,
}) => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  const endpointsKey = JSON.stringify(endpoints);

  useEffect(() => {
    let mounted = true;

    const fetchReviews = async () => {
      try {
        setLoading(true);
        const endpointList = Array.isArray(endpoints) ? endpoints : [endpoints];

        const responses = await Promise.all(
          endpointList.map((ep) =>
            fetch(`${API_BASE_URL}${ep}`).then((res) =>
              res.ok ? res.json() : { results: [] },
            ),
          ),
        );

        const allProviders = responses.flatMap((payload) =>
          normalizeProviderList(payload),
        );

        const mapped = allProviders
          .flatMap((provider) => {
            const providerName = getProviderName(provider);
            const providerReviews = Array.isArray(provider?.ratings)
              ? provider.ratings
              : [];

            return providerReviews
              .filter((item) => {
                return typeof item?.review === "string" && item.review.trim();
              })
              .map((item, index) => {
                let reviewerName =
                  (typeof item?.userId === "object" && item?.userId?.name) ||
                  item?.userName ||
                  item?.name ||
                  "Pet Parent";

                if (
                  !reviewerName ||
                  reviewerName.toLowerCase() === "verified pet parent" ||
                  reviewerName.toLowerCase() === "anonymous"
                ) {
                  reviewerName = "Pet Parent";
                }

                return {
                  id: `${provider?._id || providerName}-${index}`,
                  reviewerName,
                  providerName,
                  rating: Math.max(1, Math.min(5, Number(item?.rating) || 0)),
                  review: item.review.trim(),
                  createdAt: item.createdAt,
                };
              });
          })
          .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
          .slice(0, maxItems);

        if (mounted) setReviews(mapped);
      } catch (error) {
        console.error("ReviewSlider fetch error:", error);
        if (mounted) setReviews([]);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchReviews();
    return () => {
      mounted = false;
    };
  }, [endpointsKey, maxItems]);

  const shouldAnimate = reviews.length > 1;
  const scrollReviews = useMemo(() => {
    if (reviews.length === 0) return [];
    // Repeat enough times to fill the track even on wide screens
    if (reviews.length === 1) return [reviews[0]];
    if (reviews.length < 5)
      return [...reviews, ...reviews, ...reviews, ...reviews];
    if (reviews.length < 10) return [...reviews, ...reviews, ...reviews];
    return [...reviews, ...reviews];
  }, [reviews]);

  const durationSeconds = Math.max(15, reviews.length * 4);

  return (
    <section className={styles.reviewsSection}>
      <SectionHeader
        className={styles.sectionHeader}
        align="center"
        level="section"
        icon={icon}
        title={title}
        subtitle={subtitle}
      />

      {loading && <p className={styles.helperText}>Loading reviews...</p>}

      {!loading && reviews.length === 0 && (
        <p className={styles.helperText}>{emptyText}</p>
      )}

      {!loading && reviews.length > 0 && (
        <div className={styles.sliderViewport}>
          <div
            className={`${styles.sliderTrack} ${shouldAnimate ? styles.animate : ""}`}
            style={{ "--scroll-duration": `${durationSeconds}s` }}
          >
            {scrollReviews.map((review, index) => (
              <article className={styles.card} key={`${review.id}-${index}`}>
                <header className={styles.cardHeader}>
                  <div className={styles.avatar}>
                    {getInitials(review.reviewerName)}
                  </div>
                  <div className={styles.headerContent}>
                    <h4 className={styles.reviewer}>{review.reviewerName}</h4>
                    <p className={styles.provider}>for {review.providerName}</p>
                  </div>
                  <span className={styles.date}>
                    {formatDate(review.createdAt)}
                  </span>
                </header>

                <p className={styles.feedback}>{review.review}</p>

                <div className={styles.ratingRow}>
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      size={16}
                      fill={i < review.rating ? "#fbbf24" : "none"}
                      stroke={i < review.rating ? "#fbbf24" : "#cbd5e1"}
                    />
                  ))}
                </div>
              </article>
            ))}
          </div>
        </div>
      )}
    </section>
  );
};

export default ReviewSlider;

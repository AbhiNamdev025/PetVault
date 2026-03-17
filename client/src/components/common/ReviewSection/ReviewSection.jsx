import React, { useEffect, useMemo, useState } from "react";
import { Star, ChevronDown, ChevronUp } from "lucide-react";
import Button from "../Button/Button";
import Pagination from "../Pagination/Pagination";
import SectionHeader from "../SectionHeader/SectionHeader";
import Textarea from "../Textarea/Textarea";
import styles from "./ReviewSection.module.css";

const stars = [1, 2, 3, 4, 5];

const getDefaultKey = (review, index) => review?._id || `review-${index}`;
const getDefaultAuthor = (review) => {
  const name =
    review?.userId?.name || review?.userName || review?.name || "Pet Parent";
  const lowerName = name.toLowerCase();
  if (lowerName === "verified pet parent" || lowerName === "anonymous")
    return "Pet Parent";
  return name;
};
const getDefaultDate = (review) =>
  review?.createdAt ? new Date(review.createdAt).toLocaleDateString() : "";
const getDefaultRating = (review) => Number(review?.rating || 0);
const getDefaultText = (review) => review?.review || "";

const joinClasses = (...classes) => classes.filter(Boolean).join(" ");

const ReviewSection = ({
  title = "Reviews",
  count,
  formTitle = "Write a Review",
  formDescription,
  ratingValue = 0,
  onRatingChange,
  reviewValue = "",
  onReviewChange,
  placeholder = "Share your experience...",
  onSubmit,
  submitting = false,
  submitText = "Submit Review",
  submittingText = "Submitting...",
  reviews = [],
  emptyText = "No reviews yet.",
  maxLength = 500,
  getKey = getDefaultKey,
  getAuthor = getDefaultAuthor,
  getDate = getDefaultDate,
  getRating = getDefaultRating,
  getText = getDefaultText,
  itemsPerPageDesktop = 3,
  itemsPerPageMobile = 1,
  className = "",
}) => {
  const safeReviews = useMemo(() => {
    if (!Array.isArray(reviews)) return [];
    return [...reviews].sort(
      (a, b) => new Date(b.createdAt) - new Date(a.createdAt),
    );
  }, [reviews]);

  const [itemsPerPage, setItemsPerPage] = useState(itemsPerPageDesktop);
  const [currentPage, setCurrentPage] = useState(1);
  const [isFormVisible, setIsFormVisible] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(max-width: 768px)");
    const syncItemsPerPage = () =>
      setItemsPerPage(
        mediaQuery.matches ? itemsPerPageMobile : itemsPerPageDesktop,
      );

    syncItemsPerPage();
    if (typeof mediaQuery.addEventListener === "function") {
      mediaQuery.addEventListener("change", syncItemsPerPage);
      return () => mediaQuery.removeEventListener("change", syncItemsPerPage);
    }
    mediaQuery.addListener(syncItemsPerPage);
    return () => mediaQuery.removeListener(syncItemsPerPage);
  }, [itemsPerPageDesktop, itemsPerPageMobile]);

  const totalPages = useMemo(
    () =>
      Math.max(1, Math.ceil(safeReviews.length / Math.max(itemsPerPage, 1))),
    [safeReviews.length, itemsPerPage],
  );

  useEffect(() => {
    setCurrentPage((prev) => Math.min(prev, totalPages));
  }, [totalPages]);

  const visibleReviews = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return safeReviews.slice(startIndex, startIndex + itemsPerPage);
  }, [safeReviews, currentPage, itemsPerPage]);

  return (
    <section className={joinClasses(styles.section, className)}>
      <SectionHeader
        title={title}
        count={typeof count === "number" ? count : undefined}
        level="section"
        className={styles.header}
      />

      <div className={styles.formRow}>
        <div
          className={styles.formHeader}
          onClick={() => setIsFormVisible(!isFormVisible)}
        >
          <h3 className={styles.formTitle}>{formTitle}</h3>
          {isFormVisible ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
        </div>

        {isFormVisible && (
          <>
            {formDescription && (
              <p className={styles.formDescription}>{formDescription}</p>
            )}

            <div className={styles.starRow}>
              {stars.map((star) => (
                <Button
                  key={star}
                  type="button"
                  className={styles.starButton}
                  onClick={() => onRatingChange?.(star)}
                  variant="ghost"
                  size="sm"
                  aria-label={`Rate ${star}`}
                >
                  <Star
                    size={20}
                    className={
                      ratingValue >= star ? styles.starFilled : styles.starEmpty
                    }
                    fill={ratingValue >= star ? "currentColor" : "none"}
                  />
                </Button>
              ))}
            </div>

            <Textarea
              value={reviewValue}
              onChange={(e) => onReviewChange?.(e.target.value)}
              placeholder={placeholder}
              maxLength={maxLength}
              fullWidth
            />

            <Button
              className={styles.submitButton}
              onClick={onSubmit}
              disabled={submitting}
              variant="primary"
              size="md"
            >
              {submitting ? submittingText : submitText}
            </Button>
          </>
        )}
      </div>

      <div className={styles.sliderRow}>
        {safeReviews.length === 0 ? (
          <div className={styles.emptyCard}>{emptyText}</div>
        ) : (
          visibleReviews.map((review, index) => {
            const absoluteIndex = (currentPage - 1) * itemsPerPage + index;
            const score = Math.max(0, Math.min(5, getRating(review)));
            return (
              <article
                key={getKey(review, absoluteIndex)}
                className={styles.reviewCard}
              >
                <div className={styles.reviewHeader}>
                  <strong className={styles.reviewer}>
                    {getAuthor(review)}
                  </strong>
                  <span className={styles.reviewDate}>{getDate(review)}</span>
                </div>

                <div className={styles.reviewStars}>
                  {stars.map((star) => (
                    <Star
                      key={star}
                      size={14}
                      className={
                        score >= star ? styles.starFilled : styles.starEmpty
                      }
                      fill={score >= star ? "currentColor" : "none"}
                    />
                  ))}
                </div>

                <p className={styles.reviewText}>{getText(review)}</p>
              </article>
            );
          })
        )}
      </div>

      {safeReviews.length > 0 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          hideIfSinglePage={false}
          onPageChange={setCurrentPage}
        />
      )}
    </section>
  );
};

export default ReviewSection;

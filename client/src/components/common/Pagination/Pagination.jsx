import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Button from "../Button/Button";
import styles from "./Pagination.module.css";

const Pagination = ({
  currentPage = 1,
  totalPages = 1,
  onPageChange,
  hideIfSinglePage = true,
  showPageInfo = false,
  showPageNumbers = false,
  enableSwipe = true,
  className = "",
}) => {
  const safeTotalPages = Math.max(totalPages, 1);
  const safeCurrentPage = Math.min(Math.max(currentPage, 1), safeTotalPages);
  const pageNumbersRef = React.useRef(null);
  const swipeRef = React.useRef({
    startX: 0,
    startY: 0,
    canSwipe: true,
  });

  const goToPage = React.useCallback(
    (page) => {
      const nextPage = Math.min(Math.max(page, 1), safeTotalPages);
      if (nextPage !== safeCurrentPage) {
        onPageChange(nextPage);
      }
    },
    [onPageChange, safeCurrentPage, safeTotalPages],
  );

  const pages = React.useMemo(
    () => Array.from({ length: safeTotalPages }, (_, index) => index + 1),
    [safeTotalPages],
  );

  React.useEffect(() => {
    if (!showPageNumbers) return;

    const activeButton = pageNumbersRef.current?.querySelector(
      `[data-page="${safeCurrentPage}"]`,
    );
    activeButton?.scrollIntoView({
      behavior: "smooth",
      block: "nearest",
      inline: "center",
    });
  }, [safeCurrentPage, showPageNumbers]);

  if (typeof onPageChange !== "function") return null;
  if (hideIfSinglePage && safeTotalPages <= 1) return null;

  const handleTouchStart = (event) => {
    if (!enableSwipe) return;
    const touch = event.changedTouches?.[0];
    if (!touch) return;

    swipeRef.current.startX = touch.clientX;
    swipeRef.current.startY = touch.clientY;
    swipeRef.current.canSwipe = true;
  };

  const handleTouchEnd = (event) => {
    if (!enableSwipe || !swipeRef.current.canSwipe) return;
    const touch = event.changedTouches?.[0];
    if (!touch) return;

    const deltaX = swipeRef.current.startX - touch.clientX;
    const deltaY = swipeRef.current.startY - touch.clientY;
    const minSwipeDistance = 40;
    const maxVerticalDistance = 35;

    if (Math.abs(deltaY) > maxVerticalDistance) return;

    if (deltaX > minSwipeDistance) {
      goToPage(safeCurrentPage + 1);
      return;
    }

    if (deltaX < -minSwipeDistance) {
      goToPage(safeCurrentPage - 1);
    }
  };

  return (
    <div
      className={[styles.pagination, className].filter(Boolean).join(" ")}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      <Button
        variant="ghost"
        size="sm"
        leftIcon={<ChevronLeft size={16} />}
        disabled={safeCurrentPage <= 1}
        onClick={() => goToPage(safeCurrentPage - 1)}
      >
        Prev
      </Button>

      {showPageNumbers && safeTotalPages > 1 && (
        <div className={styles.pageNumbers} ref={pageNumbersRef}>
          {pages.map((page) => {
            const isActive = page === safeCurrentPage;
            return (
              <Button
                key={page}
                type="button"
                size="sm"
                variant={isActive ? "primary" : "ghost"}
                className={`${styles.pageButton} ${isActive ? styles.pageButtonActive : ""}`}
                onClick={() => goToPage(page)}
                data-page={page}
                aria-label={`Go to page ${page}`}
                aria-current={isActive ? "page" : undefined}
              >
                {page}
              </Button>
            );
          })}
        </div>
      )}

      {showPageInfo && (
        <div className={styles.pageInfo}>
          Page {safeCurrentPage} of {safeTotalPages}
        </div>
      )}

      <Button
        variant="ghost"
        size="sm"
        rightIcon={<ChevronRight size={16} />}
        disabled={safeCurrentPage >= safeTotalPages}
        onClick={() => goToPage(safeCurrentPage + 1)}
      >
        Next
      </Button>
    </div>
  );
};

export default Pagination;

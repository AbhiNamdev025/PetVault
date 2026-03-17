import React from "react";
import { Filter, Search } from "lucide-react";
import Button from "../Button/Button";
import styles from "./SearchFilterBar.module.css";

const SearchFilterBar = ({
  searchPlaceholder = "Search...",
  searchValue = "",
  onSearchChange,
  searchMaxLength = 40,
  resultText = "",
  showFilterButton = false,
  onFilterClick,
  hasActiveFilters = false,
  onClear,
  filterLabel = "Filters",
  clearLabel = "Clear",
  className = "",
}) => {
  const normalizedMaxLength = Math.max(1, Number(searchMaxLength) || 40);
  const normalizedSearchValue = String(searchValue || "").slice(
    0,
    normalizedMaxLength,
  );

  return (
    <div className={[styles.actionsWrap, className].filter(Boolean).join(" ")}>
      <div className={styles.resultsActions}>
        <div className={styles.searchBox}>
          <Search size={18} className={styles.searchIcon} />
          <input
            type="text"
            placeholder={searchPlaceholder}
            value={normalizedSearchValue}
            maxLength={normalizedMaxLength}
            onChange={(e) =>
              onSearchChange?.(
                String(e.target.value || "").slice(0, normalizedMaxLength),
              )
            }
            className={styles.searchInput}
          />
        </div>

        {resultText && (
          <span className={styles.resultsCount}>{resultText}</span>
        )}

        {showFilterButton && (
          <Button
            variant="ghost"
            size="sm"
            className={styles.filterBtn}
            onClick={onFilterClick}
          >
            <Filter size={16} />
            {filterLabel}
            {hasActiveFilters && <span className={styles.filterDot} />}
          </Button>
        )}

        {showFilterButton && hasActiveFilters && onClear && (
          <Button
            variant="ghost"
            size="sm"
            className={styles.clearBtn}
            onClick={onClear}
          >
            {clearLabel}
          </Button>
        )}
      </div>
    </div>
  );
};

export default SearchFilterBar;

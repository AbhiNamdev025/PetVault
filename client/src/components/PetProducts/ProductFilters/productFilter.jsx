import React from "react";
import { Search, SlidersHorizontal } from "lucide-react";
import styles from "./productFilter.module.css";

const ProductFilters = ({
  searchTerm,
  onSearchChange,
  category,
  onCategoryChange,
  sortOrder,
  onSortChange,
}) => {
  return (
    <div className={styles.filtersContainer}>
      <div className={styles.filtersRow}>
        <div className={styles.searchBox}>
          <Search size={20} className={styles.searchIcon} />
          <input
            type="text"
            placeholder="Search products..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className={styles.searchInput}
          />
        </div>

        <div className={styles.filterBox}>
          <SlidersHorizontal size={18} className={styles.filterIcon} />
          <select
            value={category}
            onChange={(e) => onCategoryChange(e.target.value)}
            className={styles.filterSelect}
          >
            <option value="all">All Categories</option>
            <option value="food">Food</option>
            <option value="toy">Toys</option>
            <option value="accessory">Accessories</option>
            <option value="health">Health</option>
            <option value="grooming">Grooming</option>
            <option value="bedding">Bedding</option>
          </select>
        </div>

        <div className={styles.filterBox}>
          <SlidersHorizontal size={18} className={styles.filterIcon} />
          <select
            value={sortOrder}
            onChange={(e) => onSortChange(e.target.value)}
            className={styles.filterSelect}
          >
            <option value="newest">Newest</option>
            <option value="price_low_high">Price: Low to High</option>
            <option value="price_high_low">Price: High to Low</option>
            <option value="rating_high">Top Rated</option>
          </select>
        </div>
      </div>
    </div>
  );
};

export default ProductFilters;

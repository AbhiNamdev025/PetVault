import React from "react";
import { Search, Filter } from "lucide-react";
import styles from "./petfilters.module.css";

const PetFilters = ({
  searchTerm,
  onSearchChange,
  filterGender,
  onGenderChange,
}) => {
  return (
    <div className={styles.filtersContainer}>
      <div className={styles.filtersRow}>
        <div className={styles.searchBox}>
          <Search size={20} className={styles.searchIcon} />
          <input
            type="text"
            placeholder="Search pets by name or breed..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className={styles.searchInput}
          />
        </div>

        <div className={styles.filterBox}>
          <Filter size={18} className={styles.filterIcon} />
          <select
            value={filterGender}
            onChange={(e) => onGenderChange(e.target.value)}
            className={styles.filterSelect}
          >
            <option value="all">All Genders</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
          </select>
        </div>
      </div>
    </div>
  );
};

export default PetFilters;

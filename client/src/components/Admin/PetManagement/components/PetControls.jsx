import React from "react";
import { Search } from "lucide-react";
import { Input, Select } from "../../../common";
import commonStyles from "../../common/AdminCommon.module.css";
import styles from "../petManagement.module.css";

const PET_TYPE_OPTIONS = [
  { value: "all", label: "All Types" },
  { value: "dog", label: "Dogs" },
  { value: "cat", label: "Cats" },
  { value: "bird", label: "Birds" },
  { value: "rabbit", label: "Rabbits" },
  { value: "other", label: "Other" },
];

const CATEGORY_OPTIONS = [
  { value: "all", label: "All Categories" },
  { value: "shop", label: "For Sale" },
  { value: "adoption", label: "For Adoption" },
];

const AVAILABILITY_OPTIONS = [
  { value: "all", label: "All Availability" },
  { value: "available", label: "Available" },
  { value: "sold", label: "Sold" },
];

const PetControls = ({
  searchTerm,
  onSearchChange,
  filterType,
  onFilterTypeChange,
  filterCategory,
  onFilterCategoryChange,
  filterAvailability,
  onFilterAvailabilityChange,
}) => {
  return (
    <div className={commonStyles.controlsRow}>
      <div className={commonStyles.searchWrapper}>
        <Input
          placeholder="Search pets by name or breed..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          icon={<Search size={18} />}
          fullWidth
        />
      </div>
      <div className={styles.filterGroup}>
        <Select
          value={filterType}
          onChange={(e) => onFilterTypeChange(e.target.value)}
          options={PET_TYPE_OPTIONS}
          className={styles.miniSelect}
        />
        <Select
          value={filterCategory}
          onChange={(e) => onFilterCategoryChange(e.target.value)}
          options={CATEGORY_OPTIONS}
          className={styles.miniSelect}
        />
        <Select
          value={filterAvailability}
          onChange={(e) => onFilterAvailabilityChange(e.target.value)}
          options={AVAILABILITY_OPTIONS}
          className={styles.miniSelect}
        />
      </div>
    </div>
  );
};

export default PetControls;

import React from "react";
import styles from "../petManagement.module.css";
import { Button, Select } from "../../../common";
import AdminHeader from "../../common/AdminHeader/AdminHeader";

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

const PetHeader = ({
  viewMode,
  onViewModeChange,
  filterType,
  onFilterTypeChange,
  filterCategory,
  onFilterCategoryChange,
  filterAvailability,
  onFilterAvailabilityChange,
}) => {
  return (
    <AdminHeader
      title="Pets Management"
      subtitle={
        viewMode === "active"
          ? "Review and manage all active pet listings."
          : "Review and restore previously removed pet listings."
      }
      actions={
        <div className={styles.headerActions}>
          <div className={styles.viewToggle}>
            <Button
              onClick={() => onViewModeChange("active")}
              variant={viewMode === "active" ? "primary" : "ghost"}
              size="sm"
            >
              Active
            </Button>
            <Button
              onClick={() => onViewModeChange("archived")}
              variant={viewMode === "archived" ? "primary" : "ghost"}
              size="sm"
            >
              Archived
            </Button>
          </div>
          <Select
            value={filterType}
            onChange={(event) => onFilterTypeChange(event.target.value)}
            options={PET_TYPE_OPTIONS}
            className={styles.headerSelect}
          />
          <Select
            value={filterCategory}
            onChange={(event) => onFilterCategoryChange(event.target.value)}
            options={CATEGORY_OPTIONS}
            className={styles.headerSelect}
          />
          <Select
            value={filterAvailability}
            onChange={(event) => onFilterAvailabilityChange(event.target.value)}
            options={AVAILABILITY_OPTIONS}
            className={styles.headerSelect}
          />
        </div>
      }
    />
  );
};

export default PetHeader;

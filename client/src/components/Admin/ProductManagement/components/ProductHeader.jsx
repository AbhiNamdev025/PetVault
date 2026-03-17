import React from "react";
import styles from "../productManagement.module.css";
import { Button, Select } from "../../../common";
import AdminHeader from "../../common/AdminHeader/AdminHeader";

const PRODUCT_CATEGORIES = [
  { value: "all", label: "All Categories" },
  { value: "food", label: "Food" },
  { value: "toy", label: "Toys" },
  { value: "accessory", label: "Accessories" },
  { value: "health", label: "Health" },
  { value: "grooming", label: "Grooming" },
  { value: "bedding", label: "Bedding" },
];

const ProductHeader = ({
  viewMode,
  onViewModeChange,
  filterCategory,
  onFilterCategoryChange,
}) => {
  return (
    <AdminHeader
      title="Products Management"
      subtitle={
        viewMode === "active"
          ? "Review and manage all active product listings."
          : "Review and restore previously removed product listings."
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
            value={filterCategory}
            onChange={(event) => onFilterCategoryChange(event.target.value)}
            options={PRODUCT_CATEGORIES}
            className={styles.headerSelect}
          />
        </div>
      }
    />
  );
};

export default ProductHeader;

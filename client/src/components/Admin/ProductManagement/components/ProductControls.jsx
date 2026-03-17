import React from "react";
import { Search } from "lucide-react";
import { Input, Select } from "../../../common";
import commonStyles from "../../common/AdminCommon.module.css";
import styles from "../productManagement.module.css";

const PRODUCT_CATEGORIES = [
  { value: "all", label: "All Categories" },
  { value: "food", label: "Food" },
  { value: "toy", label: "Toys" },
  { value: "accessory", label: "Accessories" },
  { value: "health", label: "Health" },
  { value: "grooming", label: "Grooming" },
  { value: "bedding", label: "Bedding" },
];

const ProductControls = ({
  searchTerm,
  onSearchChange,
  filterCategory,
  onFilterCategoryChange,
}) => {
  return (
    <div className={commonStyles.controlsRow}>
      <div className={commonStyles.searchWrapper}>
        <Input
          placeholder="Search by name or brand..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          icon={<Search size={18} />}
          fullWidth
        />
      </div>
      <div className={styles.filterGroup}>
        <Select
          value={filterCategory}
          onChange={(e) => onFilterCategoryChange(e.target.value)}
          options={PRODUCT_CATEGORIES}
          className={styles.miniSelect}
        />
      </div>
    </div>
  );
};

export default ProductControls;

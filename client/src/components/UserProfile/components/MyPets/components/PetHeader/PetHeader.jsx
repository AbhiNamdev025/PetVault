import React from "react";
import { Filter, Plus } from "lucide-react";
import Button from "../../../../../common/Button/Button";
import styles from "../../myPets.module.css";

const PetHeader = ({
  onAdd,
  hasActiveFilters,
  onOpenFilters,
  onClearFilters,
}) => {
  return (
    <div className={styles.header}>
      <div>
        <h2 className={styles.title}>My Pets</h2>
        <p className={styles.subtitle}>
          Manage your pets' profiles and health records
        </p>
      </div>

      <div className={styles.headerActions}>
        <Button
          variant="ghost"
          size="sm"
          className={styles.filterBtn}
          onClick={onOpenFilters}
        >
          <Filter size={16} />
          Filters
          {hasActiveFilters && <span className={styles.filterDot} />}
        </Button>
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            className={styles.clearBtn}
            onClick={onClearFilters}
          >
            Clear
          </Button>
        )}
        <Button variant="primary" onClick={onAdd}>
          <Plus size={20} />
          <span>Add New Pet</span>
        </Button>
      </div>
    </div>
  );
};

export default PetHeader;

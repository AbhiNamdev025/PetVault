import React from "react";
import { Filter, Plus } from "lucide-react";
import { Button } from "../../../../../../common";
import styles from "../petManagement.module.css";

const PetHeader = ({
  hasActiveFilters,
  onOpenFilters,
  onClearFilters,
  onAdd,
  hideTitleBlock = false,
}) => {
  return (
    <div
      className={`${styles.topRow} ${hideTitleBlock ? styles.topRowActionsOnly : ""}`}
    >
      {!hideTitleBlock && (
        <div className={styles.titleBlock}>
          <h2 className={styles.title}>Manage Pets</h2>
          <p className={styles.subtitle}>
            Keep your pet listings updated with complete details and status.
          </p>
        </div>
      )}
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
        <Button
          variant="ghost"
          size="sm"
          className={styles.addBtn}
          onClick={onAdd}
        >
          <Plus size={16} /> Add Pet
        </Button>
      </div>
    </div>
  );
};

export default PetHeader;

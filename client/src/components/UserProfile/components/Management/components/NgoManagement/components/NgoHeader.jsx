import React from "react";
import { Filter, Plus } from "lucide-react";
import { Button } from "../../../../../../common";
import styles from "../ngoManagement.module.css";

const NgoHeader = ({
  hasActiveFilters,
  onOpenFilters,
  onClearFilters,
  onAdd,
}) => {
  return (
    <div className={styles.topRow}>
      <div className={styles.titleBlock}>
        <h2 className={styles.title}>Manage Pets for Adoption</h2>
        <p className={styles.subtitle}>
          Publish and maintain adoption-ready pet profiles consistently.
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

export default NgoHeader;

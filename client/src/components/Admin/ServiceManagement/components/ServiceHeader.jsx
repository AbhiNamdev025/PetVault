import React from "react";
import { Plus, Filter } from "lucide-react";
import styles from "../serviceManagement.module.css";
import { Button } from "../../../common";
import AdminHeader from "../../common/AdminHeader/AdminHeader";

const SERVICE_TYPE_OPTIONS = [
  { value: "all", label: "All Types" },
  { value: "vet", label: "Vet" },
  { value: "daycare", label: "Daycare" },
  { value: "grooming", label: "Grooming" },
  { value: "training", label: "Training" },
  { value: "boarding", label: "Boarding" },
];

const ServiceHeader = ({ onAdd, onShowFilters, hasActiveFilters }) => {
  return (
    <AdminHeader
      title="Services Management"
      subtitle="Manage veterinary, grooming, and daycare services."
      actions={
        <div className={styles.headerActions}>
          <Button
            className={styles.filterBtn}
            onClick={onShowFilters}
            variant="ghost"
            size="sm"
          >
            <Filter size={16} />
            Filters
            {hasActiveFilters && <span className={styles.filterDot} />}
          </Button>
          <Button onClick={onAdd} variant="primary" size="sm">
            <Plus size={18} />
            Add New Service
          </Button>
        </div>
      }
    />
  );
};

export default ServiceHeader;

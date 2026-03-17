import React from "react";
import { Search, Filter } from "lucide-react";
import { Input, Select } from "../../../common";
import styles from "../serviceManagement.module.css";

const ServiceControls = ({
  searchTerm,
  onSearchChange,
  filterType,
  onFilterTypeChange,
}) => {
  return (
    <div className={styles.controls}>
      <div className={styles.searchBox}>
        <Search size={20} />
        <Input
          type="text"
          placeholder="Search services by name..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          fullWidth
        />
      </div>
      <Select
        value={filterType}
        onChange={(e) => onFilterTypeChange(e.target.value)}
        className={styles.filterSelect}
        icon={<Filter size={16} />}
        options={[
          { label: "All Types", value: "all" },
          { label: "Vet", value: "vet" },
          { label: "Daycare", value: "daycare" },
          { label: "Grooming", value: "grooming" },
          { label: "Training", value: "training" },
          { label: "Boarding", value: "boarding" },
        ]}
      />
    </div>
  );
};

export default ServiceControls;

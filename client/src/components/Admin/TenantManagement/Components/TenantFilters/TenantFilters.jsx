import React from "react";
import FilterSidebar from "../../../../common/FilterSidebar/FilterSidebar";

const TenantFilters = ({
  isOpen,
  onClose,
  filters,
  setFilters,
  options,
  onReset,
}) => {
  return (
    <FilterSidebar
      isOpen={isOpen}
      onClose={onClose}
      filters={filters}
      setFilters={setFilters}
      options={options}
      onReset={onReset}
    />
  );
};

export default TenantFilters;

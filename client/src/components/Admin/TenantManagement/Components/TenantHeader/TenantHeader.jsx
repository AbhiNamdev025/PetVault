import React from "react";
import { Filter } from "lucide-react";
import { Button } from "../../../../common";
import AdminHeader from "../../../common/AdminHeader/AdminHeader";

const TenantHeader = ({ onFilterToggle, hasActiveFilters }) => {
  return (
    <AdminHeader
      title="Tenants Management"
      subtitle="Manage and verify platform service providers and users."
      actions={
        <Button
          onClick={onFilterToggle}
          variant={hasActiveFilters ? "primary" : "ghost"}
          size="sm"
        >
          <Filter size={18} />
          Filters {hasActiveFilters && "(Active)"}
        </Button>
      }
    />
  );
};

export default TenantHeader;

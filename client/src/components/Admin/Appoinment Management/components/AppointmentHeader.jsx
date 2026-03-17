import React from "react";
import { Filter } from "lucide-react";
import { Button } from "../../../common";
import AdminHeader from "../../common/AdminHeader/AdminHeader";

const AppointmentHeader = ({ onOpenFilters, hasActiveFilters }) => {
  return (
    <AdminHeader
      title="Appointment Management"
      subtitle="Overview and coordination of all platform service appointments."
      actions={
        <Button
          onClick={onOpenFilters}
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

export default AppointmentHeader;

import React from "react";
import { Filter } from "lucide-react";
import { Button } from "../../../common";
import AdminHeader from "../../common/AdminHeader/AdminHeader";

const OrderHeader = ({ onOpenFilters, hasActiveFilters }) => {
  return (
    <AdminHeader
      title="Order Management"
      subtitle="Track and manage customer orders and fulfillment status."
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

export default OrderHeader;

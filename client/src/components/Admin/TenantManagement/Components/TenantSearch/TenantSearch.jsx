import React from "react";
import { Search } from "lucide-react";
import { Input } from "../../../../common";
import commonStyles from "../../../common/AdminCommon.module.css";

const TenantSearch = ({ search, onSearchChange }) => {
  return (
    <div className={commonStyles.controlsRow}>
      <div className={commonStyles.searchWrapper}>
        <Input
          placeholder="Search by name, email, role, phone..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          icon={<Search size={18} />}
          fullWidth
        />
      </div>
    </div>
  );
};

export default TenantSearch;

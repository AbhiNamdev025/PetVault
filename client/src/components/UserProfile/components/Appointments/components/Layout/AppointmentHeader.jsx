import React from "react";
import { Filter, RefreshCw } from "lucide-react";
import { Button } from "../../../../../common";
import AppointmentTabs from "../Tabs/AppointmentTabs";
import styles from "../../appointments.module.css";

const AppointmentHeader = ({
  activeTab,
  onTabChange,
  setShowFilters,
  hasActiveFilters,
  onClear,
  handleRefresh,
  isRefreshing,
}) => {
  return (
    <div className={styles.tabsContainer}>
      <AppointmentTabs activeTab={activeTab} onTabChange={onTabChange} />
      <div className={styles.tabActions}>
        <Button
          className={styles.filterBtn}
          onClick={() => setShowFilters(true)}
          title="Open filters"
          variant="ghost"
          size="sm"
        >
          <Filter size={16} />
          Filters
          {hasActiveFilters && <span className={styles.filterDot} />}
        </Button>
        {hasActiveFilters && (
          <Button
            className={styles.clearBtnInline}
            onClick={onClear}
            variant="ghost"
            size="sm"
          >
            Clear
          </Button>
        )}
        <Button
          className={styles.refreshBtn}
          onClick={handleRefresh}
          title="Refresh Appointments"
          variant="ghost"
          size="md"
        >
          <RefreshCw
            size={18}
            className={isRefreshing ? styles.spinning : ""}
          />
        </Button>
      </div>
    </div>
  );
};

export default AppointmentHeader;

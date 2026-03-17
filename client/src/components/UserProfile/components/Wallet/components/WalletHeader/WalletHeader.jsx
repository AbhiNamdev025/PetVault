import React from "react";
import { RefreshCw, Wallet as WalletIcon, Filter } from "lucide-react";
import { Button } from "../../../../../common";
import styles from "./WalletHeader.module.css";

const WalletHeader = ({
  onRefresh,
  isRefreshing,
  setShowFilters,
  hasActiveFilters,
  onClear,
}) => {
  return (
    <div className={styles.header}>
      <div className={styles.titleWrap}>
        <div>
          <h2>Wallet</h2>
          <p>
            Track wallet balance, payouts, and withdrawal requests in one place.
          </p>
        </div>
      </div>
      <div className={styles.headerActions}>
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
          onClick={onRefresh}
          variant="ghost"
          size="md"
          title="Refresh wallet"
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

export default WalletHeader;

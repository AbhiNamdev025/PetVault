import React from "react";
import styles from "./WalletStats.module.css";

const WalletStats = ({
  balance,
  isProvider,
  availableToWithdraw,
  totalEarnings,
  formatCurrency,
}) => {
  return (
    <div className={styles.statsGrid}>
      <div className={styles.statCard}>
        <p>Wallet Balance</p>
        <h3>{formatCurrency(balance)}</h3>
      </div>
      {isProvider && (
        <div className={styles.statCard}>
          <p>Available to Withdraw</p>
          <h3>{formatCurrency(availableToWithdraw || 0)}</h3>
        </div>
      )}
      {isProvider && (
        <div className={styles.statCard}>
          <p>Total Earnings (All Time)</p>
          <h3>{formatCurrency(totalEarnings || 0)}</h3>
        </div>
      )}
    </div>
  );
};

export default WalletStats;

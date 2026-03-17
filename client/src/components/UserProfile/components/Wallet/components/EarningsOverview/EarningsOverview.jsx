import React from "react";
import { Landmark } from "lucide-react";
import styles from "./EarningsOverview.module.css";

const EarningsOverview = ({
  providerSummary,
  payoutSummary,
  providerRole,
  formatCurrency,
}) => {
  const normalizedRole = String(providerRole || "")
    .trim()
    .toLowerCase();
  const showProductsBreakdown =
    normalizedRole === "shop" &&
    Number(providerSummary?.orderEarnings || 0) > 0;
  const showPetsBreakdown = normalizedRole === "shop";
  const showAppointmentsBreakdown = true;

  return (
    <div className={styles.earningsCard}>
      <div className={styles.earningsHead}>
        <Landmark size={16} />
        <h3>Earnings Breakdown</h3>
      </div>
      <p className={styles.payoutHint}>
        Values shown here are all-time totals used for payout calculations.
      </p>
      <div className={styles.earningsGrid}>
        <div>
          <span>Online Income</span>
          <strong>
            {formatCurrency(providerSummary?.onlineEarnings || 0)}
          </strong>
        </div>
        <div>
          <span>Offline Income (Cash)</span>
          <strong>
            {formatCurrency(providerSummary?.offlineEarnings || 0)}
          </strong>
        </div>
        {showProductsBreakdown && (
          <div>
            <span>By Products</span>
            <strong>
              {formatCurrency(providerSummary?.orderEarnings || 0)}
            </strong>
          </div>
        )}
        {showPetsBreakdown && (
          <div>
            <span>By Pets</span>
            <strong>
              {formatCurrency(providerSummary?.petSalesEarnings || 0)}
            </strong>
          </div>
        )}

        <div>
          <span>Disbursed</span>
          <strong>
            {formatCurrency(payoutSummary?.payouts?.disbursedAmount || 0)}
          </strong>
        </div>
        <div>
          <span>Available to Withdraw</span>
          <strong>
            {formatCurrency(payoutSummary?.payouts?.availableToRequest || 0)}
          </strong>
        </div>
      </div>
    </div>
  );
};

export default EarningsOverview;

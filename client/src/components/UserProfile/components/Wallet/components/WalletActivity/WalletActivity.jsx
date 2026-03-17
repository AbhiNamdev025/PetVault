import React from "react";
import { ArrowDownLeft, ArrowUpRight, Wallet as WalletIcon } from "lucide-react";
import { EmptyState } from "../../../../../common";
import styles from "./WalletActivity.module.css";

const WalletActivity = ({ loading, ledger, formatDateTime, formatCurrency }) => {
  return (
    <div className={styles.ledgerCard}>
      <h3>Wallet Activity</h3>
      {loading ? (
        <div className={styles.loading}>Loading wallet activity...</div>
      ) : ledger.length === 0 ? (
        <EmptyState
          title="No Wallet Activity"
          description="Wallet transactions will appear here when you use or receive wallet credits."
          icon={<WalletIcon size={28} />}
        />
      ) : (
        <div className={styles.ledgerList}>
          {ledger.map((entry) => {
            const isCredit = Number(entry.amount || 0) > 0;
            return (
              <div className={styles.ledgerRow} key={entry._id}>
                <div className={styles.left}>
                  <span
                    className={`${styles.tag} ${isCredit ? styles.creditTag : styles.debitTag}`}
                  >
                    {isCredit ? <ArrowDownLeft size={12} /> : <ArrowUpRight size={12} />}
                    {isCredit ? "Credit" : "Debit"}
                  </span>
                  <div>
                    <p>{entry.note || entry.sourceType || "Wallet activity"}</p>
                    <span>{formatDateTime(entry.createdAt)}</span>
                  </div>
                </div>
                <div className={`${styles.amount} ${isCredit ? styles.credit : styles.debit}`}>
                  {isCredit ? "+" : ""}
                  {formatCurrency(entry.amount)}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default WalletActivity;

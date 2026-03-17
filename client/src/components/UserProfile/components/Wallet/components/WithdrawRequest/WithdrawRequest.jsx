import React, { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { Button, Select, Input } from "../../../../../common";
import styles from "./WithdrawRequest.module.css";

const WithdrawRequest = ({
  payoutSummary,
  selectedPayoutAccountId,
  payoutAccountOptions,
  payoutAmount,
  payoutNote,
  requestingPayout,
  hasBankAccounts,
  onSelectPayoutAccount,
  onPayoutAmountChange,
  onPayoutNoteChange,
  onCreatePayoutRequest,
  formatCurrency,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const minPayoutAmount = Number(payoutSummary?.payouts?.minPayoutAmount || 0);
  const maxPayoutAmount = Number(payoutSummary?.payouts?.maxPayoutAmount || 0);
  const hasMaxPayoutAmount =
    Number.isFinite(maxPayoutAmount) && maxPayoutAmount > 0;
  const platformFeePercent = Number(
    payoutSummary?.payouts?.platformFeePercent || 0,
  );
  const enteredPayoutAmount = Number(payoutAmount || 0);

  return (
    <div className={styles.payoutCard}>
      <div
        className={styles.cardHeader}
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <h3>Request Withdrawal</h3>
        {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
      </div>

      {isExpanded && (
        <div className={styles.cardContent}>
          <p className={styles.payoutHint}>
            Available to withdraw:{" "}
            <strong>
              {formatCurrency(payoutSummary?.payouts?.availableToRequest || 0)}
            </strong>
          </p>
          <p className={styles.payoutHint}>
            Allowed range per request:{" "}
            <strong>
              {formatCurrency(minPayoutAmount)} -{" "}
              {hasMaxPayoutAmount
                ? formatCurrency(maxPayoutAmount)
                : "No limit (up to available balance)"}
            </strong>
          </p>
          <p className={styles.payoutHint}>
            Platform fee on each payout: <strong>{platformFeePercent}%</strong>
          </p>
          <p className={styles.warningText}>
            Withdrawals are not accepted on Saturday and Sunday due to bank
            holidays.
          </p>
          <div className={styles.formGrid}>
            <div className={styles.formGroup}>
              <Select
                label="Payout Account"
                name="payoutAccount"
                value={selectedPayoutAccountId}
                onChange={onSelectPayoutAccount}
                options={payoutAccountOptions}
                placeholder="Select payout account"
                fullWidth
              />
            </div>
            <div className={styles.formGroup}>
              <Input
                label="Amount (INR)"
                type="number"
                min={minPayoutAmount}
                max={hasMaxPayoutAmount ? maxPayoutAmount : undefined}
                step="0.01"
                value={payoutAmount}
                onChange={onPayoutAmountChange}
                placeholder="Enter amount"
                fullWidth
              />
            </div>
            <div className={styles.formGroup}>
              <Input
                label="Note"
                value={payoutNote}
                onChange={onPayoutNoteChange}
                placeholder="Optional note for admin"
                maxLength={200}
                fullWidth
              />
            </div>
          </div>
          {enteredPayoutAmount > 0 && (
            <p className={styles.payoutHint}>
              Estimated net disbursement:{" "}
              <strong>
                {formatCurrency(
                  Math.max(
                    0,
                    enteredPayoutAmount -
                      (enteredPayoutAmount * platformFeePercent) / 100,
                  ),
                )}
              </strong>
            </p>
          )}
          <div className={styles.formActions}>
            <Button
              onClick={onCreatePayoutRequest}
              disabled={requestingPayout || !hasBankAccounts}
              variant="primary"
              size="md"
            >
              {requestingPayout ? "Submitting..." : "Submit Withdrawal"}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default WithdrawRequest;

import React from "react";
import { Button, Select } from "../../../../../common";
import styles from "./WithdrawalRequests.module.css";

const WithdrawalRequests = ({
  payoutStatusFilter,
  payoutStatusOptions,
  filteredPayoutRequests,
  onPayoutStatusFilterChange,
  onCancelPayout,
  formatCurrency,
  formatDateTime,
  toReadableStatus,
}) => {
  return (
    <div className={styles.payoutCard}>
      <div className={styles.payoutHead}>
        <h3>Withdrawal Requests</h3>
        <Select
          name="payoutStatusFilter"
          value={payoutStatusFilter}
          onChange={onPayoutStatusFilterChange}
          options={payoutStatusOptions}
          placeholder="Filter status"
          className={styles.statusFilter}
        />
      </div>

      {filteredPayoutRequests.length === 0 ? (
        <p className={styles.emptyHint}>No payout requests found.</p>
      ) : (
        <div className={styles.payoutList}>
          {filteredPayoutRequests.map((request) => {
            const statusClass =
              styles[String(request.status || "pending").toLowerCase()] || "";

            return (
              <div key={request._id} className={styles.payoutRow}>
                <div className={styles.payoutRowLeft}>
                  <p>
                    {formatCurrency(
                      Number(request?.netAmount || request?.amount || 0),
                    )}
                  </p>
                  <span>
                    Gross {formatCurrency(request?.amount || 0)} • Fee{" "}
                    {formatCurrency(request?.platformFeeAmount || 0)}
                  </span>
                  <span>{formatDateTime(request.createdAt)}</span>
                </div>
                <div className={styles.payoutRowMid}>
                  <span>
                    {request?.bankAccountSelected?.bankName ||
                      request?.bankDetailsMasked?.bankName ||
                      "Payout Account"}
                  </span>
                  <small>
                    {request?.bankAccountSelected?.accountNumberMasked ||
                      request?.bankDetailsMasked?.accountNumberMasked ||
                      "-"}
                  </small>
                </div>
                <div className={styles.payoutRowRight}>
                  <span className={`${styles.statusTag} ${statusClass}`}>
                    {toReadableStatus(request.status)}
                  </span>
                  {(request.disbursementReference || request.utrNumber) && (
                    <small className={styles.payoutRefText}>
                      {request.disbursementReference
                        ? `Ref: ${request.disbursementReference}`
                        : ""}
                      {request.disbursementReference && request.utrNumber
                        ? " • "
                        : ""}
                      {request.utrNumber ? `UTR: ${request.utrNumber}` : ""}
                    </small>
                  )}
                  {request.status === "pending" && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className={styles.cancelRequestBtn}
                      onClick={() => onCancelPayout(request._id)}
                    >
                      Cancel
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default WithdrawalRequests;

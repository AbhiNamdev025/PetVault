import React from "react";
import { ArrowLeft, RotateCcw, Archive, Check, X } from "lucide-react";
import styles from "./detailHeader.module.css";
import { Button } from "../../../../../../common";

const DetailHeader = ({ onBack, userData, onArchive, onApprove, onReject }) => {
  return (
    <div className={styles.topBar}>
      <Button
        className={styles.backBtn}
        onClick={onBack}
        variant="ghost"
        size="sm"
      >
        <ArrowLeft size={18} /> Back to Management
      </Button>

      <div className={styles.headerActions}>
        <Button
          className={`${styles.actionBtn} ${styles.archive}`}
          onClick={onArchive}
          variant="danger"
          size="md"
        >
          {userData.isArchived ? (
            <>
              <RotateCcw size={16} /> Unarchive
            </>
          ) : (
            <>
              <Archive size={16} /> Archive
            </>
          )}
        </Button>

        {userData.role !== "user" && userData.role !== "admin" && (
          <>
            {userData.kycStatus === "pending" ||
            userData.kycStatus === "rejected" ? (
              <Button
                className={`${styles.actionBtn} ${styles.approve}`}
                onClick={onApprove}
                variant="success"
                size="md"
              >
                <Check size={16} /> Approve Provider
              </Button>
            ) : (
              <Button
                className={`${styles.actionBtn} ${styles.reject}`}
                onClick={onReject}
                variant="danger"
                size="md"
              >
                <X size={16} /> Revoke Approval
              </Button>
            )}

            {userData.kycStatus === "pending" && (
              <Button
                className={`${styles.actionBtn} ${styles.reject}`}
                onClick={onReject}
                variant="danger"
                size="md"
              >
                <X size={16} /> Reject Provider
              </Button>
            )}
          </>
        )}
      </div>
    </div>
  );
};
export default DetailHeader;

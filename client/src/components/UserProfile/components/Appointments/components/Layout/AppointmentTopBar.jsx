import React from "react";
import { ArrowLeft, PencilLine, CheckCircle } from "lucide-react";
import { Button } from "../../../../../common";
import styles from "../../appointments.module.css";

const AppointmentTopBar = ({
  onBack,
  canEditResult,
  onEditResult,
  canAssignPet,
  onAssignPet,
  userName,
  selectedAppt,
  isProviderView,
  onConfirm,
  onComplete,
  isClientView,
  onCancel,
  cancelEligibility,
}) => {
  return (
    <div className={styles.detailsTopBar}>
      <Button
        className={styles.backBtn}
        onClick={onBack}
        variant="ghost"
        size="sm"
      >
        <ArrowLeft size={20} /> Back to Appointments
      </Button>

      <div className={styles.detailsActionGroup}>
        {canEditResult && (
          <Button
            className={styles.btnSecondary}
            onClick={onEditResult}
            variant="ghost"
            size="md"
            title="Edit appointment result"
          >
            <PencilLine size={16} />
            Edit Result
          </Button>
        )}

        {canAssignPet && (
          <Button
            className={styles.btnPrimary}
            onClick={onAssignPet}
            variant="primary"
            size="md"
          >
            <CheckCircle size={16} />
            Assign Pet to {userName || "User"}
          </Button>
        )}

        {isProviderView && selectedAppt?.status === "pending" && (
          <Button
            className={styles.btnPrimary}
            onClick={() => onConfirm(selectedAppt._id)}
            variant="primary"
            size="md"
          >
            Confirm Appointment
          </Button>
        )}

        {isProviderView && selectedAppt?.status === "confirmed" && (
          <Button
            className={styles.btnPrimary}
            onClick={onComplete}
            variant="primary"
            size="md"
          >
            Complete Appointment
          </Button>
        )}

        {((isClientView && selectedAppt?.status === "pending") ||
          (isProviderView &&
            selectedAppt?.status === "pending" &&
            cancelEligibility?.canCancel)) && (
          <Button
            className={styles.btnCancel}
            onClick={onCancel}
            disabled={isClientView && !cancelEligibility?.canCancel}
            title={
              isClientView && !cancelEligibility?.canCancel
                ? cancelEligibility.reason
                : undefined
            }
            variant="ghost"
            size="md"
          >
            Cancel Appointment
          </Button>
        )}
      </div>
    </div>
  );
};

export default AppointmentTopBar;

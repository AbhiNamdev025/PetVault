import React from "react";
import { ArrowLeft, Trash2 } from "lucide-react";
import styles from "../../appointmentDetailsModal.module.css";
import { Button } from "../../../common";
const AppointmentDetailsHeader = ({
  appointment,
  canManageStatus,
  canDelete,
  onBack,
  onDelete,
  onStatusUpdate
}) => {
  return <div className={styles.sectionHeader}>
      <Button className={styles.backBtn} onClick={onBack} type="button" variant="ghost" size="sm">
        <ArrowLeft size={18} />
        <span>Back to Overview</span>
      </Button>
      <div className={styles.headerActions}>
        {canManageStatus && appointment?.status === "pending" && <Button className={styles.confirmBtn} onClick={() => onStatusUpdate?.(appointment._id, "confirmed")} type="button" variant="primary" size="md">
            Confirm
          </Button>}
        {canManageStatus && appointment?.status === "confirmed" && <Button className={styles.completeBtn} onClick={() => onStatusUpdate?.(appointment._id, "completed")} type="button" variant="primary" size="md">
            Complete
          </Button>}
        {canDelete && <Button className={styles.deleteBtn} onClick={onDelete} type="button" variant="danger" size="sm">
            <Trash2 size={16} />
            <span>Delete</span>
          </Button>}
      </div>
    </div>;
};
export default AppointmentDetailsHeader;

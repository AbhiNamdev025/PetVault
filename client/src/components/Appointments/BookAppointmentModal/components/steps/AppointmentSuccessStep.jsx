import React from "react";
import { Check, Download } from "lucide-react";
import { Button } from "../../../../common";
import {
  toDisplayDate,
  toDisplayTime,
} from "../../../../common/AppointmentFlow/appointmentFlow.utils";
import flowStyles from "../../../../common/AppointmentFlow/appointmentFlow.module.css";
const AppointmentSuccessStep = ({
  providerName,
  formData,
  bookedAppointment,
  onBookAnother,
  onDone,
  downloadPrescription,
  providerInfo,
}) => {
  const resolvedDate = bookedAppointment?.date || formData.date;
  const resolvedTime = bookedAppointment?.time || formData.time;
  const displayDate = toDisplayDate(resolvedDate);
  const displayTime = toDisplayTime(resolvedTime);
  return (
    <div className={flowStyles.successCard}>
      <div className={flowStyles.successIcon}>
        <Check size={36} />
      </div>
      <h4 className={flowStyles.successTitle}>Appointment Submitted</h4>
      <p className={flowStyles.successText}>
        Your booking request has been sent successfully.
      </p>

      <div className={flowStyles.successMeta}>
        <div className={flowStyles.reviewItem}>
          <p className={flowStyles.reviewLabel}>Provider</p>
          <p className={flowStyles.reviewValue}>{providerName}</p>
        </div>
        <div className={flowStyles.reviewItem}>
          <p className={flowStyles.reviewLabel}>Schedule</p>
          <p className={flowStyles.reviewValue}>
            {displayTime === "Not selected"
              ? displayDate
              : `${displayDate} • ${displayTime}`}
          </p>
        </div>
        {bookedAppointment?._id && (
          <div className={flowStyles.reviewItem}>
            <p className={flowStyles.reviewLabel}>Booking ID</p>
            <p className={flowStyles.reviewValue}>
              #{bookedAppointment._id.slice(-8).toUpperCase()}
            </p>
          </div>
        )}
      </div>

      <div className={flowStyles.successActions}>
        <Button
          type="button"
          variant="secondary"
          className={flowStyles.secondaryBtn}
          onClick={() => downloadPrescription(bookedAppointment, providerInfo)}
          size="md"
        >
          <Download size={16} />
          Download Receipt
        </Button>
        <Button
          type="button"
          variant="secondary"
          className={flowStyles.secondaryBtn}
          onClick={onBookAnother}
          size="md"
        >
          Book Another
        </Button>
        <Button
          type="button"
          variant="primary"
          className={flowStyles.successBtn}
          onClick={onDone}
          size="md"
        >
          Done
        </Button>
      </div>
    </div>
  );
};
export default AppointmentSuccessStep;

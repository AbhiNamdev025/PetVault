import React from "react";
import flowStyles from "../../../../common/AppointmentFlow/appointmentFlow.module.css";
import { AppointmentSuccessStep } from "../../../../Appointments/BookAppointmentModal/components";
import {
  downloadPrescription,
  getProviderInfo,
} from "../../../../UserProfile/components/Appointments/utils/appointmentUtils";
import { BASE_URL } from "../../../../../utils/constants";
import styles from "../serviceBookingForm.module.css";

const SuccessStep = ({
  providerName,
  formData,
  bookedAppointments,
  onBookAnother,
  onDone,
  provider,
  sortedSelectedDates,
  failedBookings,
}) => {
  const bookedAppointment = bookedAppointments[0] || null;
  const providerInfo = getProviderInfo(
    { ...bookedAppointment, providerId: provider },
    BASE_URL,
  );

  return (
    <>
      <AppointmentSuccessStep
        providerName={providerName}
        formData={{
          ...formData,
          date: sortedSelectedDates[0] || formData.date,
        }}
        bookedAppointment={bookedAppointment}
        onBookAnother={onBookAnother}
        onDone={onDone}
        downloadPrescription={(appointment, info) => {
          if (!appointment) return;
          downloadPrescription(appointment, info);
        }}
        providerInfo={providerInfo}
      />

      {bookedAppointments.length > 1 && (
        <div className={styles.bookingIds}>
          <p className={styles.bookingIdsLabel}>Booking IDs</p>
          <div className={styles.bookingIdList}>
            {bookedAppointments.map((appointment) => (
              <span key={appointment?._id} className={styles.bookingIdChip}>
                #{appointment?._id?.slice(-8)?.toUpperCase()}
              </span>
            ))}
          </div>
        </div>
      )}

      {failedBookings.length > 0 && (
        <p className={styles.partialWarning}>
          {failedBookings.length} date(s) failed to book. Please retry those dates.
        </p>
      )}

      {bookedAppointments.length > 1 && (
        <p className={flowStyles.successText}>
          Submitted for {bookedAppointments.length} dates.
        </p>
      )}
    </>
  );
};

export default SuccessStep;

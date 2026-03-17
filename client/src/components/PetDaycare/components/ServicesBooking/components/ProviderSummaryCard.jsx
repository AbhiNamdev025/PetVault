import React from "react";
import { PawPrint } from "lucide-react";
import bookingStyles from "../../../../Appointments/BookAppointmentModal/bookAppointmentModal.module.css";
import { ProviderSummaryCard as BookingProviderSummaryCard } from "../../../../Appointments/BookAppointmentModal/components";
import styles from "../serviceBookingForm.module.css";

const ProviderSummaryCard = ({
  provider,
  providerImage,
  providerName,
  providerMeta,
  providerId,
  isLoadingProvider,
  onImageError,
}) => {
  if (provider) {
    return (
      <BookingProviderSummaryCard
        provider={provider}
        providerImage={providerImage}
        providerName={providerName}
        providerMeta={providerMeta}
        ProviderIcon={PawPrint}
      />
    );
  }

  return (
    <div className={bookingStyles.providerCard}>
      <div className={bookingStyles.providerIdentity}>
        <img
          src={providerImage}
          className={bookingStyles.providerImage}
          alt={providerName}
          onError={onImageError}
        />

        <div className={bookingStyles.providerInfo}>
          <p className={styles.providerLabel}>Booking With</p>
          <h3 className={bookingStyles.providerName}>
            {isLoadingProvider ? "Loading provider..." : providerName}
          </h3>
          {providerMeta && <p className={bookingStyles.providerMeta}>{providerMeta}</p>}
          {!providerId && (
            <p className={styles.providerWarning}>
              Please start booking from a specific caretaker/daycare card.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProviderSummaryCard;

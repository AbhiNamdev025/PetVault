import React, { useMemo } from "react";
import { toDisplayDate } from "../../../../common";
import flowStyles from "../../../../common/AppointmentFlow/appointmentFlow.module.css";
import { AppointmentReviewStep } from "../../../../Appointments/BookAppointmentModal/components";

const ReviewStep = ({
  providerName,
  formData,
  petTypeDisplayLabel,
  sortedSelectedDates,
  reasonPayload,
  showPricing,
  safeCoinRate,
  coinBalance,
  safeMaxCoins,
  safeCoinsToUse,
  coinDiscount,
  billingUnits,
  unitProviderFee,
  feePercent,
  platformFee,
  totalPayable,
  providerFee,
  finalPayable,
  supportsOnlinePayment,
  selectedPaymentMethod,
  onPaymentMethodChange,
  setCoinsToUse,
}) => {
  const reviewFormData = useMemo(
    () => ({
      ...formData,
      date: sortedSelectedDates[0] || "",
      reason: reasonPayload,
    }),
    [formData, reasonPayload, sortedSelectedDates],
  );

  const showDateRange = sortedSelectedDates.length > 1;
  const selectedDatesLabel = useMemo(
    () => sortedSelectedDates.map((dateValue) => toDisplayDate(dateValue)).join(", "),
    [sortedSelectedDates],
  );

  return (
    <>
        <AppointmentReviewStep
        providerName={providerName}
        formData={reviewFormData}
        isContactFlow={false}
        resolvedPetName={formData.petName}
        resolvedPetType={petTypeDisplayLabel}
        coinBalance={coinBalance}
        coinRate={safeCoinRate}
        coinsToUse={safeCoinsToUse}
        setCoinsToUse={setCoinsToUse}
        feePercent={feePercent}
        platformFee={platformFee}
        totalPayable={totalPayable}
        maxCoins={safeMaxCoins}
        coinDiscount={coinDiscount}
        providerFee={providerFee}
        finalPayable={finalPayable}
        paymentMethod={selectedPaymentMethod}
        onPaymentMethodChange={onPaymentMethodChange}
        showPaymentMethod={supportsOnlinePayment}
      />

      {showDateRange && (
        <div className={flowStyles.reviewGridTwoCol}>
          <div className={`${flowStyles.reviewItem} ${flowStyles.reviewFullWidth}`}>
            <p className={flowStyles.reviewLabel}>Selected Dates</p>
            <p className={flowStyles.reviewValue}>{selectedDatesLabel}</p>
          </div>

          {showPricing && billingUnits > 1 && (
            <div className={`${flowStyles.reviewItem} ${flowStyles.reviewFullWidth}`}>
              <p className={flowStyles.reviewLabel}>Per Day Fee</p>
              <p className={flowStyles.reviewValue}>₹{Number(unitProviderFee || 0).toFixed(2)}</p>
            </div>
          )}
        </div>
      )}
    </>
  );
};

export default ReviewStep;

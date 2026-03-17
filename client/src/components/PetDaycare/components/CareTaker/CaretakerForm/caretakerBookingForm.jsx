import React from "react";
import ServiceBookingForm from "../../ServicesBooking/serviceBookingForm";

const CaretakerBookingForm = ({
  caretaker,
  caretakerId,
  onClose,
  onStepChange,
}) => {
  const resolvedProviderId = caretakerId || caretaker?._id || "";

  return (
    <ServiceBookingForm
      defaultService="daycare"
      providerId={resolvedProviderId}
      providerType="caretaker"
      enableMultipleDates
      onClose={onClose}
      onStepChange={onStepChange}
    />
  );
};

export default CaretakerBookingForm;

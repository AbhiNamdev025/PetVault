import React from "react";
import Modal from "../../../../../common/Modal/Modal";
import ConsultationSummary from "../Summary/ConsultationSummary";
import CompleteAppointmentForm from "../Forms/CompleteAppointmentForm";
import { Button } from "../../../../../common";

const AppointmentModal = ({
  show,
  onClose,
  mode,
  selectedAppt,
  userRole,
  downloadPrescription,
  formatTime,
  onComplete,
  isSubmitting = false,
}) => {
  if (!selectedAppt) return null;

  return (
    <Modal
      isOpen={show}
      onClose={onClose}
      title={mode === "view" ? "Consultation Summary" : "Complete Consultation"}
      size="lg"
      footer={
        mode !== "view" && (
          <Button
            type="submit"
            form="complete-appointment-form"
            fullWidth
            size="lg"
            variant="primary"
            disabled={isSubmitting}
            isLoading={isSubmitting}
            loadingText="Saving..."
          >
            Save Changes
          </Button>
        )
      }
    >
      {mode === "view" ? (
        <ConsultationSummary
          selectedAppt={selectedAppt}
          userRole={userRole}
          downloadPrescription={(a) =>
            downloadPrescription(a, {
              providerName: selectedAppt.providerName,
              providerSpec: selectedAppt.providerSpec,
              providerAvatar: selectedAppt.providerAvatar,
            })
          }
          formatTime={formatTime}
        />
      ) : (
        <CompleteAppointmentForm
          selectedAppt={selectedAppt}
          onSubmit={onComplete}
          isSubmitting={isSubmitting}
        />
      )}
    </Modal>
  );
};

export default AppointmentModal;

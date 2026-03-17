import React from "react";
import AppointmentModal from "../AppointmentModal/AppointmentModal";
import ConfirmationModal from "../../../../../ConfirmationModal/ConfirmationModal";
import CancelReasonModal from "./CancelReasonModal";
import SellPetModal from "../../../Management/components/PetManagement/sellPetModal";
import { downloadPrescription, formatTime } from "../../utils/appointmentUtils";

const AppointmentModals = ({
  showModal,
  modalMode,
  setShowModal,
  selectedAppt,
  userRole,
  handleCompletionSubmit,
  isStatusUpdating,
  showConfirmModal,
  confirmConfig,
  setShowConfirmModal,
  showCancelReasonModal,
  setShowCancelReasonModal,
  setAppointmentToCancel,
  setCancelReason,
  cancelReason,
  handleCancelWithReason,
  showSellModal,
  petToSell,
  prefillUserIdForSale,
  setShowSellModal,
  setPetToSell,
  setPrefillUserIdForSale,
  fetchAppointments,
}) => {
  return (
    <>
      <AppointmentModal
        show={showModal && modalMode !== "view"}
        onClose={() => setShowModal(false)}
        mode={modalMode}
        selectedAppt={selectedAppt}
        userRole={userRole}
        downloadPrescription={downloadPrescription}
        formatTime={formatTime}
        onComplete={handleCompletionSubmit}
        isSubmitting={isStatusUpdating}
      />

      {showConfirmModal && confirmConfig && (
        <ConfirmationModal
          config={confirmConfig}
          onConfirm={confirmConfig.onConfirm}
          onCancel={() => setShowConfirmModal(false)}
          isLoading={isStatusUpdating}
        />
      )}

      <CancelReasonModal
        isOpen={showCancelReasonModal}
        onClose={() => {
          setShowCancelReasonModal(false);
          setAppointmentToCancel(null);
          setCancelReason("");
        }}
        isStatusUpdating={isStatusUpdating}
        cancelReason={cancelReason}
        setCancelReason={setCancelReason}
        onSubmit={handleCancelWithReason}
      />

      {showSellModal && petToSell && (
        <SellPetModal
          pet={petToSell}
          prefillUserId={prefillUserIdForSale}
          onClose={() => {
            setShowSellModal(false);
            setPetToSell(null);
            setPrefillUserIdForSale(null);
          }}
          onSold={fetchAppointments}
        />
      )}
    </>
  );
};

export default AppointmentModals;

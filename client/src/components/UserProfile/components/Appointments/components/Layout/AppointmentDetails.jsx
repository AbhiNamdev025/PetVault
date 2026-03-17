import React from "react";
import AppointmentTopBar from "./AppointmentTopBar";
import ConsultationSummary from "../Summary/ConsultationSummary";
import styles from "../../appointments.module.css";
import { formatTime, downloadPrescription } from "../../utils/appointmentUtils";

const AppointmentDetails = ({
  selectedAppt,
  onBack,
  canEditResult,
  onEditResult,
  canAssignPet,
  onAssignPet,
  isProviderView,
  onConfirm,
  onComplete,
  isClientView,
  onCancel,
  cancelEligibility,
  userRole,
  profileTab,
  currentPage,
  filters,
}) => {
  return (
    <div className={styles.detailsView}>
      <AppointmentTopBar
        onBack={onBack}
        canEditResult={canEditResult}
        onEditResult={onEditResult}
        canAssignPet={canAssignPet}
        onAssignPet={onAssignPet}
        userName={selectedAppt.userName || selectedAppt.user?.name}
        selectedAppt={selectedAppt}
        isProviderView={isProviderView}
        onConfirm={onConfirm}
        onComplete={onComplete}
        isClientView={isClientView}
        onCancel={onCancel}
        cancelEligibility={cancelEligibility}
      />

      <ConsultationSummary
        selectedAppt={selectedAppt}
        userRole={userRole}
        isClientView={isClientView}
        downloadPrescription={(a) =>
          downloadPrescription(a, {
            providerName: selectedAppt.providerName,
            providerSpec: selectedAppt.providerSpec,
            providerAvatar: selectedAppt.providerAvatar,
          })
        }
        formatTime={formatTime}
        profileTab={profileTab}
        currentPage={currentPage}
        filters={filters}
      />
    </div>
  );
};

export default AppointmentDetails;

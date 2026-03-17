import React from "react";
import AppointmentCard from "../Cards/AppointmentCard";
import styles from "../../appointments.module.css";
import {
  getProviderInfo,
  getUserAvatar,
  getCancellationEligibility,
  canAssignPetForAppointment,
  downloadPrescription,
} from "../../utils/appointmentUtils";
import { BASE_URL } from "../../../../../../utils/constants";

const AppointmentGrid = ({
  appointments,
  userRole,
  user,
  isProvider,
  activeTab,
  handleConfirmAppointmentClick,
  handleCancelAppointment,
  handleCompleteClick,
  handleViewClick,
  handleAssignPetClick,
}) => {
  return (
    <div className={styles.grid}>
      {appointments.map((appt) => {
        const isClientView =
          userRole === "user" || (user && appt.user?._id === user._id);
        const isProviderView = !isClientView && isProvider;
        const { providerName, providerSpec, providerAvatar } = getProviderInfo(
          appt,
          BASE_URL,
        );
        const cancelEligibility = getCancellationEligibility(
          appt,
          isClientView,
          isProviderView,
          userRole,
        );
        const displayAvatar = isClientView
          ? providerAvatar
          : getUserAvatar(appt, BASE_URL);

        return (
          <AppointmentCard
            key={appt._id}
            appt={appt}
            userRole={userRole}
            isClientView={isClientView}
            activeTab={activeTab}
            isProvider={isProviderView}
            displayAvatar={displayAvatar}
            providerName={providerName}
            providerSpec={providerSpec}
            canCancel={cancelEligibility.canCancel}
            cancelDisabledReason={cancelEligibility.reason}
            handleConfirmAppointmentClick={handleConfirmAppointmentClick}
            handleCancelAppointment={handleCancelAppointment}
            handleCompleteClick={handleCompleteClick}
            handleViewClick={handleViewClick}
            handleAssignPetClick={handleAssignPetClick}
            canAssignPet={isProviderView && canAssignPetForAppointment(appt)}
            downloadPrescription={(a) =>
              downloadPrescription(a, {
                providerName,
                providerSpec,
                providerAvatar,
              })
            }
          />
        );
      })}
    </div>
  );
};

export default AppointmentGrid;

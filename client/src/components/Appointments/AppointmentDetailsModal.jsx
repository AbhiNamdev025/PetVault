import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import styles from "./appointmentDetailsModal.module.css";
import { API_BASE_URL } from "../../utils/constants";
import {
  getAppointmentContext,
  AppointmentDetailsBanner,
  AppointmentDetailsHeader,
  AppointmentDetailsSidebar,
  AppointmentInfoTab,
  AppointmentPetProfileTab,
  AppointmentPrescriptionTab,
  getPetIdValue,
  getProviderName,
} from "./AppointmentDetails";

const AppointmentDetailsModal = ({
  isOpen = true,
  appointment,
  onBack,
  onClose,
  onStatusUpdate,
  onDelete,
  viewMode = "standard",
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState("appointment");
  const [isResolvingPetProfile, setIsResolvingPetProfile] = useState(false);
  const isAdminView = viewMode === "admin";
  const appointmentContext = getAppointmentContext(appointment);
  const isAdoptionAppointment = appointmentContext.isAdoption;
  const isShopAppointment = appointmentContext.isShop;
  const showPrescriptionTab = isAdminView
    ? appointmentContext.isMedical
    : appointmentContext.showPrescriptionTab;
  const petIdValue = getPetIdValue(appointment);
  const canOpenPetProfile =
    Boolean(petIdValue) || (!isShopAppointment && !isAdoptionAppointment);

  useEffect(() => {
    if (appointment?._id) {
      setActiveTab("appointment");
    }
  }, [appointment?._id]);

  useEffect(() => {
    if (activeTab === "prescriptions" && !showPrescriptionTab) {
      setActiveTab("appointment");
    }
  }, [activeTab, showPrescriptionTab]);

  if (!appointment || !isOpen) return null;

  const handleBack = () => {
    if (typeof onBack === "function") {
      onBack();
      return;
    }

    if (typeof onClose === "function") {
      onClose();
    }
  };

  const canManageStatus = typeof onStatusUpdate === "function";
  const canDelete = typeof onDelete === "function";
  const provider = appointment?.providerId;
  const providerName = getProviderName(appointment);

  const openPetProfilePage = async () => {
    if (petIdValue && (isShopAppointment || isAdoptionAppointment)) {
      navigate(
        isAdoptionAppointment
          ? `/adopt-pets/${petIdValue}`
          : `/shop-pets/${petIdValue}`,
        {
          state: {
            from: location.pathname + location.search,
            activeTab: "appointments",
            appointmentId: appointment._id,
            restoreAppt: true,
          },
        },
      );
      return;
    }

    if (!appointment?._id) {
      toast.error("Pet profile cannot be opened for this appointment.");
      return;
    }

    try {
      setIsResolvingPetProfile(true);
      const token =
        localStorage.getItem("token") || sessionStorage.getItem("token");
      if (!token) {
        toast.error("Please login again.");
        return;
      }

      const response = await fetch(
        `${API_BASE_URL}/appointments/${appointment._id}/ensure-pet-profile`,
        {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      const data = await response.json();

      if (!response.ok || !data?.petId) {
        toast.error(data?.message || "Unable to open pet profile.");
        return;
      }

      navigate(`/user-pet/${data.petId}`, {
        state: {
          from: location.pathname + location.search,
          activeTab: "appointments",
          appointmentId: appointment._id,
          preserveModal: true,
          restoreAppt: true,
        },
      });
    } catch {
      toast.error("Unable to open pet profile right now.");
    } finally {
      setIsResolvingPetProfile(false);
    }
  };

  return (
    <div className={styles.sectionContainer}>
      <AppointmentDetailsHeader
        appointment={appointment}
        canManageStatus={canManageStatus}
        canDelete={canDelete}
        onBack={handleBack}
        onDelete={onDelete}
        onStatusUpdate={onStatusUpdate}
      />

      <div className={styles.container}>
        <AppointmentDetailsSidebar
          appointment={appointment}
          activeTab={activeTab}
          onTabChange={setActiveTab}
          showPrescriptionTab={showPrescriptionTab}
          petTabLabel={isAdminView ? "Pet Details" : "Pet Profile"}
        />

        <main className={styles.contentArea}>
          <AppointmentDetailsBanner
            appointment={appointment}
            isMedical={appointmentContext.isMedical}
          />

          {activeTab === "appointment" && (
            <AppointmentInfoTab
              appointment={appointment}
              provider={provider}
              providerName={providerName}
              isMedical={appointmentContext.isMedical}
              providerLabel={appointmentContext.providerLabel}
              reasonLabel={appointmentContext.reasonLabel}
              isAdminView={isAdminView}
            />
          )}

          {activeTab === "pet-profile" && (
            <AppointmentPetProfileTab
              appointment={appointment}
              petIdValue={petIdValue}
              isResolvingPetProfile={isResolvingPetProfile}
              onOpenPetProfilePage={openPetProfilePage}
              petProfileTitle={appointmentContext.petProfileTitle}
              canOpenPetProfile={canOpenPetProfile}
              isAdminView={isAdminView}
              openButtonLabel={
                isAdoptionAppointment
                  ? "View Adoption Listing"
                  : isShopAppointment
                    ? "View Shop Listing"
                    : "View Pet Profile"
              }
            />
          )}

          {activeTab === "prescriptions" && showPrescriptionTab && (
            <AppointmentPrescriptionTab appointment={appointment} />
          )}
        </main>
      </div>
    </div>
  );
};

export default AppointmentDetailsModal;

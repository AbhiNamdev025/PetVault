import React from "react";
import { AlertCircle, PawPrint } from "lucide-react";
import styles from "../../appointmentDetailsModal.module.css";
import { PetProfileContent } from "../../../UserProfile/components/MyPets/PetProfile/PetProfile";
import { Button } from "../../../common";

const AppointmentPetProfileTab = ({
  appointment,
  petIdValue,
  isResolvingPetProfile,
  onOpenPetProfilePage,
  petProfileTitle = "Pet Profile Details",
  canOpenPetProfile = true,
  isAdminView = false,
  openButtonLabel = "View Full Page",
}) => {
  const fallbackPetName = appointment?.petId?.name || appointment?.petName || "Unknown pet";
  const fallbackSpecies = appointment?.petId?.species || appointment?.petType || "Unknown species";
  const fallbackBreed =
    appointment?.petId?.breed || appointment?.petBreed || "Not specified";
  const fallbackGender =
    appointment?.petId?.gender || appointment?.petGender || "Unknown";
  const fallbackAge = appointment?.petId?.age || appointment?.petAge || "N/A";

  if (isAdminView) {
    return (
      <div className={styles.glassCard}>
        <div className={styles.headerWithAction}>
          <h3 className={styles.cardTitle}>Pet Details</h3>
          <Button
            className={styles.viewProfileBtn}
            onClick={onOpenPetProfilePage}
            disabled={isResolvingPetProfile || !canOpenPetProfile}
            type="button"
            variant="ghost"
            size="md"
          >
            {isResolvingPetProfile ? "Opening..." : openButtonLabel}
          </Button>
        </div>

        <div className={styles.infoList}>
          <div className={styles.infoItem}>
            <PawPrint size={18} />
            <div className={styles.infoText}>
              <p className={styles.label}>Pet Name</p>
              <p className={styles.value}>{fallbackPetName}</p>
            </div>
          </div>
          <div className={styles.infoItem}>
            <AlertCircle size={18} />
            <div className={styles.infoText}>
              <p className={styles.label}>Type / Breed / Gender</p>
              <p className={styles.value}>
                {fallbackSpecies} • {fallbackBreed} • {fallbackGender}
              </p>
            </div>
          </div>
          <div className={styles.infoItem}>
            <AlertCircle size={18} />
            <div className={styles.infoText}>
              <p className={styles.label}>Age</p>
              <p className={styles.value}>{fallbackAge}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.glassCard}>
      <div className={styles.headerWithAction}>
        <h3 className={styles.cardTitle}>{petProfileTitle}</h3>
        <Button
          className={styles.viewProfileBtn}
          onClick={onOpenPetProfilePage}
          disabled={isResolvingPetProfile || !canOpenPetProfile}
          type="button"
          variant="ghost"
          size="md"
        >
          {isResolvingPetProfile ? "Opening..." : openButtonLabel}
        </Button>
      </div>

      {petIdValue ? (
        <PetProfileContent petId={petIdValue} isMinimal={true} />
      ) : (
        <>
          <div className={styles.noPaymentNotice}>
            Full pet profile is not linked to this appointment yet.
          </div>
          <div className={styles.infoList}>
            <div className={styles.infoItem}>
              <PawPrint size={18} />
              <div className={styles.infoText}>
                <p className={styles.label}>Pet Name</p>
                <p className={styles.value}>{fallbackPetName}</p>
              </div>
            </div>
            <div className={styles.infoItem}>
              <AlertCircle size={18} />
              <div className={styles.infoText}>
                <p className={styles.label}>Pet Details</p>
                <p className={styles.value}>
                  {fallbackSpecies} • {fallbackBreed} • {fallbackGender}
                </p>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default AppointmentPetProfileTab;

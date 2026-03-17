import React, { useMemo } from "react";
import { ClipboardList, PawPrint, Pill } from "lucide-react";
import styles from "../../appointmentDetailsModal.module.css";
import { BASE_URL } from "../../../../utils/constants";
import { Button } from "../../../common";

const AppointmentDetailsSidebar = ({
  appointment,
  activeTab,
  onTabChange,
  showPrescriptionTab = false,
  petTabLabel = "Pet Profile",
}) => {
  const menuItems = useMemo(() => {
    const baseItems = [
      {
        id: "appointment",
        label: "Appointment Info",
        icon: <ClipboardList size={18} />,
      },
      {
        id: "pet-profile",
        label: petTabLabel,
        icon: <PawPrint size={18} />,
      },
    ];

    if (showPrescriptionTab) {
      baseItems.push({
        id: "prescriptions",
        label: "Prescription",
        icon: <Pill size={18} />,
      });
    }

    return baseItems;
  }, [petTabLabel, showPrescriptionTab]);

  const petImageFile = appointment?.petImage || appointment?.petId?.profileImage;
  const petImageUrl = petImageFile
    ? `${BASE_URL}/uploads/pets/${petImageFile}`
    : "https://via.placeholder.com/50?text=Pet";
  const petName = appointment?.petId?.name || appointment?.petName || "Pet";
  const petType = appointment?.petId?.species || appointment?.petType || "Unknown";
  const petBreed = appointment?.petId?.breed || appointment?.petBreed || "Unknown";

  return (
    <aside className={styles.sidebar}>
      <div className={styles.petMiniCard}>
        <img src={petImageUrl} alt={petName} className={styles.petMiniAvatar} />
        <div className={styles.petMiniInfo}>
          <p className={styles.petMiniName}>{petName}</p>
          <p className={styles.petMiniSpecies}>
            {petType} • {petBreed}
          </p>
        </div>
      </div>

      <p className={styles.sidebarSectionTitle}>Manage</p>
      <div className={styles.sidebarMenu}>
        {menuItems.map((item) => (
          <Button
            key={item.id}
            className={`${styles.menuItem} ${activeTab === item.id ? styles.menuItemActive : ""}`}
            onClick={() => onTabChange(item.id)}
            type="button"
            variant="primary"
            size="md"
          >
            {item.icon}
            {item.label}
          </Button>
        ))}
      </div>
    </aside>
  );
};

export default AppointmentDetailsSidebar;

import React, { useState, useRef } from "react";
import styles from "./profileInfo.module.css";
import { BASE_URL } from "../../../../utils/constants";
import { Trash2, Upload } from "lucide-react";
import toast from "react-hot-toast";

import Button from "../../../common/Button/Button";
import Modal from "../../../common/Modal/Modal";
import SharedProviderManagement from "../Management/components/sharedProviderManagement";

// New Sub-components
import ProfileHeader from "./components/ProfileHeader";
import SidebarInfo from "./components/SidebarInfo";
import DoctorInfo from "./components/DoctorInfo";
import HospitalInfo from "./components/HospitalInfo";
import CaretakerInfo from "./components/CaretakerInfo";
import DaycareInfo from "./components/DaycareInfo";
import ShopInfo from "./components/ShopInfo";
import NGOInfo from "./components/NGOInfo";
import UserInfo from "./components/UserInfo";

const ProfileInfo = ({ user, onEdit, onUpdateUser, onVerificationClick }) => {
  const [showAvailabilityModal, setShowAvailabilityModal] = useState(false);
  const [showAvatarModal, setShowAvatarModal] = useState(false);
  const avatarFileRef = useRef(null);

  const handleAvatarClick = () => {
    setShowAvatarModal(true);
  };

  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("avatar", file);

    try {
      const token =
        localStorage.getItem("token") || sessionStorage.getItem("token");
      const res = await fetch(`${BASE_URL}/api/user/profile`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (!res.ok) throw new Error("Failed to update profile picture");
      const updatedUser = await res.json();
      onUpdateUser(updatedUser);
      toast.success("Profile picture updated!");
      setShowAvatarModal(false);
    } catch (error) {
      toast.error(error.message);
    }
  };

  const handleAvatarRemove = async () => {
    try {
      const token =
        localStorage.getItem("token") || sessionStorage.getItem("token");
      const res = await fetch(`${BASE_URL}/api/user/profile`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ removeAvatar: true }),
      });

      if (!res.ok) throw new Error("Failed to remove profile picture");
      const updatedUser = await res.json();
      onUpdateUser(updatedUser);
      toast.success("Profile picture removed!");
      setShowAvatarModal(false);
    } catch (error) {
      toast.error(error.message);
    }
  };

  const formatTime = (time) => {
    if (!time) return "";
    const [h, m] = time.split(":").map(Number);
    const ampm = h >= 12 ? "PM" : "AM";
    const hours = h % 12 || 12;
    return `${hours}:${(m || 0).toString().padStart(2, "0")} ${ampm}`;
  };

  const getShopTypeLabel = (type) => {
    const types = {
      petStore: "Pet Store",
      groomingCenter: "Grooming Center",
      medicalStore: "Medical Store",
      mixed: "Mixed Store",
    };
    return types[type] || type;
  };

  const renderRoleSpecificInfo = () => {
    const props = { roleData: user?.roleData, address: user?.address };

    switch (user?.role) {
      case "doctor":
        return <DoctorInfo {...props} />;
      case "hospital":
        return <HospitalInfo {...props} />;
      case "caretaker":
        return <CaretakerInfo {...props} />;
      case "daycare":
        return <DaycareInfo {...props} />;
      case "shop":
        return (
          <ShopInfo
            {...props}
            getShopTypeLabel={getShopTypeLabel}
            formatTime={formatTime}
          />
        );
      case "ngo":
        return <NGOInfo {...props} />;
      case "user":
        return <UserInfo {...props} />;
      default:
        return null;
    }
  };

  return (
    <div className={styles.container}>
      <ProfileHeader
        user={user}
        onEdit={onEdit}
        onAvatarClick={handleAvatarClick}
        avatarFileRef={avatarFileRef}
        onAvatarChange={handleAvatarChange}
        onVerificationClick={onVerificationClick}
      />

      <div className={styles.dashboardGrid}>
        <SidebarInfo
          user={user}
          availability={user?.availability}
          onEditAvailability={() => setShowAvailabilityModal(true)}
          formatTime={formatTime}
        />

        <div className={styles.mainColumn}>{renderRoleSpecificInfo()}</div>
      </div>

      {showAvailabilityModal && (
        <Modal
          isOpen={showAvailabilityModal}
          onClose={() => setShowAvailabilityModal(false)}
          title="Availability Management"
          size="lg"
        >
          <SharedProviderManagement
            user={user}
            title={user.role.charAt(0).toUpperCase() + user.role.slice(1)}
            onSuccess={(updated) => {
              if (onUpdateUser) onUpdateUser(updated);
              setShowAvailabilityModal(false);
            }}
          />
        </Modal>
      )}

      {showAvatarModal && (
        <Modal
          isOpen={showAvatarModal}
          onClose={() => setShowAvatarModal(false)}
          title="Profile Picture"
        >
          <div className={styles.bannerModalContent}>
            <div className={styles.avatarPreviewLarge}>
              <img
                src={
                  user?.avatar
                    ? `${BASE_URL}/uploads/avatars/${user.avatar}`
                    : "https://t4.ftcdn.net/jpg/08/23/12/53/360_F_823125376_UqbbrYsPTiMuIlEnzcbzP81oT7ErOM07.jpg"
                }
                alt="avatar preview"
              />
            </div>

            <div className={styles.modalActions}>
              <Button
                variant="outline"
                fullWidth
                onClick={() => avatarFileRef.current.click()}
                icon={<Upload size={18} />}
              >
                Change Photo
              </Button>

              {user?.avatar && (
                <Button
                  variant="danger-outline"
                  fullWidth
                  onClick={handleAvatarRemove}
                  icon={<Trash2 size={18} />}
                >
                  Remove Photo
                </Button>
              )}
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default ProfileInfo;

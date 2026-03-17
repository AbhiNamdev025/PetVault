import React from "react";
import {
  Camera,
  Briefcase,
  BadgeCheck,
  AlertCircle,
  Pencil,
} from "lucide-react";
import styles from "../profileInfo.module.css";
import { BASE_URL } from "../../../../../utils/constants";
import Button from "../../../../common/Button/Button";

const ProfileHeader = ({
  user,
  onEdit,
  onAvatarClick,
  avatarFileRef,
  onAvatarChange,
  onVerificationClick,
}) => {
  return (
    <div className={styles.headerBanner}>
      <div className={styles.bannerBackground}></div>
      <div className={styles.bannerContent}>
        <div className={styles.profileMain}>
          <div className={styles.avatarWrapper} onClick={onAvatarClick}>
            <img
              src={
                user?.avatar
                  ? `${BASE_URL}/uploads/avatars/${user.avatar}`
                  : "https://t4.ftcdn.net/jpg/08/23/12/53/360_F_823125376_UqbbrYsPTiMuIlEnzcbzP81oT7ErOM07.jpg"
              }
              className={styles.avatar}
              alt="avatar"
            />
            <div className={styles.avatarOverlay}>
              <Camera size={24} />
            </div>
          </div>
          <input
            type="file"
            ref={avatarFileRef}
            className={styles.hiddenInput}
            onChange={onAvatarChange}
            accept="image/*"
          />
          <div className={styles.identity}>
            <h1 className={styles.name}>{user?.name}</h1>
            <div className={styles.badgeRow}>
              <span className={styles.roleBadge}>{user?.role}</span>
              {user?.roleData?.doctorExperience && (
                <span className={styles.expBadge}>
                  {user.roleData.doctorExperience} Years Exp
                </span>
              )}
              {user?.role !== "user" && (
                <>
                  {user?.kycStatus === "approved" ? (
                    <span className={styles.verifiedBadge}>
                      <BadgeCheck size={14} /> Verified
                    </span>
                  ) : (
                    <span className={styles.unverifiedBadge}>
                      <AlertCircle size={14} />{" "}
                      {user?.kycStatus || "Unverified"}
                    </span>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
        <div className={styles.headerActions}>
          {user?.role !== "user" && user?.kycStatus !== "approved" && (
            <Button
              variant="warning"
              size="md"
              onClick={onVerificationClick}
              style={{ marginRight: "12px" }}
            >
              <AlertCircle size={18} /> Complete Verification
            </Button>
          )}
          <Button variant="primary" size="md" onClick={onEdit}>
            <Pencil size={18} /> Edit Profile
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ProfileHeader;

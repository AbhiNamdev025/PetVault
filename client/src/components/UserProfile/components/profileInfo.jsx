import React from "react";
import styles from "../userProfile.module.css";
import { BASE_URL } from "../../../utils/constants";

const ProfileInfo = ({ user }) => {
  const renderRoleSpecificInfo = () => {
    const roleData = user.roleData || {};

    switch (user.role) {
      case "doctor":
        return (
          <div className={styles.roleSection}>
            <h3 className={styles.sectionTitle}>Professional Information</h3>
            <div className={styles.roleGrid}>
              {roleData.doctorName && (
                <div className={styles.infoItem}>
                  <strong>Doctor Name:</strong> {roleData.doctorName}
                </div>
              )}
              {roleData.doctorSpecialization && (
                <div className={styles.infoItem}>
                  <strong>Specialization:</strong>{" "}
                  {roleData.doctorSpecialization}
                </div>
              )}
              {roleData.doctorExperience && (
                <div className={styles.infoItem}>
                  <strong>Experience:</strong> {roleData.doctorExperience} years
                </div>
              )}
              {roleData.consultationFee && (
                <div className={styles.infoItem}>
                  <strong>Consultation Fee:</strong> ₹{roleData.consultationFee}
                </div>
              )}
              {roleData.hospitalName && (
                <div className={styles.infoItem}>
                  <strong>Hospital:</strong> {roleData.hospitalName}
                </div>
              )}
            </div>
          </div>
        );

      case "hospital":
        return (
          <div className={styles.roleSection}>
            <h3 className={styles.sectionTitle}>Hospital Information</h3>
            <div className={styles.roleGrid}>
              {roleData.hospitalName && (
                <div className={styles.infoItem}>
                  <strong>Hospital Name:</strong> {roleData.hospitalName}
                </div>
              )}
              {roleData.hospitalDescription && (
                <div className={styles.infoItem}>
                  <strong>Description:</strong> {roleData.hospitalDescription}
                </div>
              )}
              {roleData.hospitalServices &&
                roleData.hospitalServices.length > 0 && (
                  <div className={styles.infoItem}>
                    <strong>Services:</strong>{" "}
                    {roleData.hospitalServices.join(", ")}
                  </div>
                )}
            </div>
          </div>
        );

      case "caretaker":
        return (
          <div className={styles.roleSection}>
            <h3 className={styles.sectionTitle}>Service Information</h3>
            <div className={styles.roleGrid}>
              {roleData.staffSpecialization && (
                <div className={styles.infoItem}>
                  <strong>Specialization:</strong>{" "}
                  {roleData.staffSpecialization}
                </div>
              )}
              {roleData.staffExperience && (
                <div className={styles.infoItem}>
                  <strong>Experience:</strong> {roleData.staffExperience} years
                </div>
              )}
              {roleData.serviceDescription && (
                <div className={styles.infoItem}>
                  <strong>Service Description:</strong>{" "}
                  {roleData.serviceDescription}
                </div>
              )}
              {roleData.hourlyRate && (
                <div className={styles.infoItem}>
                  <strong>Hourly Rate:</strong> ₹{roleData.hourlyRate}
                </div>
              )}
            </div>
          </div>
        );

      case "daycare":
        return (
          <div className={styles.roleSection}>
            <h3 className={styles.sectionTitle}>Daycare Information</h3>
            <div className={styles.roleGrid}>
              {roleData.daycareName && (
                <div className={styles.infoItem}>
                  <strong>Daycare Name:</strong> {roleData.daycareName}
                </div>
              )}
              {roleData.maxPetsAllowed && (
                <div className={styles.infoItem}>
                  <strong>Max Pets:</strong> {roleData.maxPetsAllowed}
                </div>
              )}
              {roleData.daycareDescription && (
                <div className={styles.infoItem}>
                  <strong>Description:</strong> {roleData.daycareDescription}
                </div>
              )}
            </div>
          </div>
        );

      case "shop":
        return (
          <div className={styles.roleSection}>
            <h3 className={styles.sectionTitle}>Shop Information</h3>
            <div className={styles.roleGrid}>
              {roleData.shopName && (
                <div className={styles.infoItem}>
                  <strong>Shop Name:</strong> {roleData.shopName}
                </div>
              )}
              {roleData.shopType && (
                <div className={styles.infoItem}>
                  <strong>Shop Type:</strong> {roleData.shopType}
                </div>
              )}
              {roleData.deliveryAvailable !== undefined && (
                <div className={styles.infoItem}>
                  <strong>Delivery:</strong>{" "}
                  {roleData.deliveryAvailable ? "Available" : "Not Available"}
                </div>
              )}
              {roleData.deliveryRadius && (
                <div className={styles.infoItem}>
                  <strong>Delivery Radius:</strong> {roleData.deliveryRadius} km
                </div>
              )}
            </div>
          </div>
        );

      case "ngo":
        return (
          <div className={styles.roleSection}>
            <h3 className={styles.sectionTitle}>NGO Information</h3>
            <div className={styles.roleGrid}>
              {roleData.ngoName && (
                <div className={styles.infoItem}>
                  <strong>NGO Name:</strong> {roleData.ngoName}
                </div>
              )}
              {roleData.servicesOffered &&
                roleData.servicesOffered.length > 0 && (
                  <div className={styles.infoItem}>
                    <strong>Services Offered:</strong>{" "}
                    {roleData.servicesOffered.join(", ")}
                  </div>
                )}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  const getAvailabilityStatus = () => {
    if (!user.availability)
      return { status: "unknown", text: "Status Unknown", color: "#6b7280" };

    if (user.availability.available === false) {
      return {
        status: "unavailable",
        text: "Currently Unavailable",
        color: "#ef4444",
      };
    }

    if (user.availability.available === true) {
      return { status: "available", text: "Available Now", color: "#10b981" };
    }

    return { status: "unknown", text: "Status Unknown", color: "#6b7280" };
  };

  const availability = getAvailabilityStatus();

  return (
    <div className={styles.card}>
      <div className={styles.profileHeader}>
        <div className={styles.left}>
          <div className={styles.avatarSection}>
            <div className={styles.avatarWrapper}>
              <img
                src={
                  user.avatar
                    ? `${BASE_URL}/uploads/avatars/${user.avatar}`
                    : "https://i.pinimg.com/236x/d5/ef/b5/d5efb56c3aff04b52ef374e9ae99eb39.jpg"
                }
                className={styles.avatar}
                alt="avatar"
              />
            </div>

            {/* Availability Status Badge */}
            {user.role !== "user" && user.role !== "admin" && (
              <div
                className={styles.availabilityBadge}
                style={{ backgroundColor: availability.color }}
              >
                {availability.text}
              </div>
            )}
          </div>

          <div className={styles.basicInfo}>
            <h2 className={styles.name}>{user.name}</h2>
            <div className={styles.roleBadge}>{user.role}</div>
            <div className={styles.contactInfo}>
              <p className={styles.email}>{user.email}</p>
              <p className={styles.phone}>{user.phone || "No phone number"}</p>
            </div>
          </div>
        </div>

        <div className={styles.right}>
          <div className={styles.addressSection}>
            <h3 className={styles.sectionTitle}>Address</h3>
            <p className={styles.addressText}>
              {user.address
                ? `${user.address.street || ""}, ${user.address.city || ""}, ${
                    user.address.state || ""
                  } ${user.address.zipCode || ""}`
                : "No address added"}
            </p>
          </div>

          {renderRoleSpecificInfo()}

          {user.availability &&
            user.role !== "user" &&
            user.role !== "admin" && (
              <div className={styles.availabilitySection}>
                <h3 className={styles.sectionTitle}>Availability Schedule</h3>
                <div className={styles.scheduleGrid}>
                  {user.availability.days &&
                  user.availability.days.length > 0 ? (
                    <>
                      <div className={styles.scheduleItem}>
                        <strong>Days:</strong>{" "}
                        {user.availability.days.join(", ")}
                      </div>
                      {user.availability.startTime && (
                        <div className={styles.scheduleItem}>
                          <strong>Timing:</strong> {user.availability.startTime}{" "}
                          - {user.availability.endTime}
                        </div>
                      )}
                      {user.availability.serviceRadius && (
                        <div className={styles.scheduleItem}>
                          <strong>Service Radius:</strong>{" "}
                          {user.availability.serviceRadius} km
                        </div>
                      )}
                      {user.availability.statusNote && (
                        <div className={styles.scheduleItem}>
                          <strong>Note:</strong> {user.availability.statusNote}
                        </div>
                      )}
                    </>
                  ) : (
                    <p className={styles.small}>No schedule set</p>
                  )}
                </div>
              </div>
            )}
        </div>
      </div>
    </div>
  );
};

export default ProfileInfo;

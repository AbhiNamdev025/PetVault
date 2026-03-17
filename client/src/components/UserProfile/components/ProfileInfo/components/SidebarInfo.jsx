import React from "react";
import { Phone, Mail, Calendar, Pencil, Clock } from "lucide-react";
import styles from "../profileInfo.module.css";
import { Button } from "../../../../common";
const SidebarInfo = ({
  user,
  availability,
  onEditAvailability,
  formatTime,
}) => {
  const isAvailable = availability?.available;
  const days = availability?.days || [];
  const hideServiceRadiusRoles = new Set([
    "doctor",
    "hospital",
    "daycare",
    "caretaker",
  ]);
  const shouldShowServiceRadius =
    !hideServiceRadiusRoles.has(String(user?.role || "").toLowerCase());
  return (
    <div className={styles.sideColumn}>
      {/* CONTACT CARD */}
      <div className={styles.sideCard}>
        <div className={styles.sideCardTitle}>
          <Phone size={18} /> Contact Info
        </div>
        <div className={styles.contactList}>
          <div className={styles.contactItem}>
            <Mail size={16} />
            <span>{user?.email}</span>
          </div>
          <div className={styles.contactItem}>
            <Phone size={16} />
            <span>{user?.phone || "No phone added"}</span>
          </div>
        </div>
      </div>

      {/* AVAILABILITY CARD */}
      {user?.role !== "user" && user?.role !== "admin" && availability && (
        <div className={styles.sideCard}>
          <div className={styles.sideCardTitleWithAction}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
              }}
            >
              <Calendar size={18} /> Availability
            </div>
            <Button
              className={styles.editActionBtn}
              onClick={onEditAvailability}
              title="Edit Availability"
              variant="primary"
              size="md"
            >
              <Pencil size={14} />
            </Button>
          </div>

          <div className={styles.statusIndicator}>
            <span
              className={`${styles.statusDot} ${isAvailable ? styles.active : styles.inactive}`}
            ></span>
            <span className={styles.statusText}>
              {isAvailable ? "Currently Online" : "Currently Offline"}
            </span>
          </div>

          {days.length > 0 ? (
            <div className={styles.scheduleMini}>
              <div className={styles.dayTabsSmall}>
                {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map(
                  (day) => {
                    const isWorkDay = days.some(
                      (d) =>
                        d.toLowerCase().startsWith(day.toLowerCase()) ||
                        day.toLowerCase().startsWith(d.toLowerCase()),
                    );
                    return (
                      <span
                        key={day}
                        className={`${styles.dayPill} ${isWorkDay ? styles.activePill : styles.inactivePill}`}
                        title={isWorkDay ? "Available" : "Not Available"}
                      >
                        {day.substring(0, 1)}
                      </span>
                    );
                  },
                )}
              </div>
              <div className={styles.timingBox}>
                <Clock size={14} />
                <span>
                  {formatTime(availability.startTime)} -{" "}
                  {formatTime(availability.endTime)}
                </span>
              </div>
            </div>
          ) : (
            <p className={styles.emptyNote}>No schedule defined</p>
          )}

          {availability.statusNote && (
            <div className={styles.noteBox}>
              <p>{availability.statusNote}</p>
            </div>
          )}
          {isAvailable && availability.serviceRadius && shouldShowServiceRadius && (
              <div
                className={styles.timingBox}
                style={{
                  marginTop: "12px",
                  borderTop: "1px solid var(--color-border-light)",
                  paddingTop: "12px",
                }}
              >
                <Clock size={14} />
                <span>Service Radius: {availability.serviceRadius} km</span>
              </div>
            )}
        </div>
      )}
    </div>
  );
};
export default SidebarInfo;

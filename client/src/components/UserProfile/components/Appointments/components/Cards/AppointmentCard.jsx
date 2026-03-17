import React from "react";
import {
  Calendar,
  Clock,
  MapPin,
  CheckCircle,
  XCircle,
  Download,
  AlertTriangle,
} from "lucide-react";
import styles from "../../appointments.module.css";
import { formatTime } from "../../utils/appointmentUtils";
import { Button } from "../../../../../common";

const formatCompactScheduleDates = (dates = []) => {
  if (!Array.isArray(dates) || dates.length === 0) return "";
  if (dates.length === 1) {
    return dates[0].toLocaleDateString("en-US", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  }

  const firstDate = dates[0];
  const sameMonthYear = dates.every(
    (dateValue) =>
      dateValue.getMonth() === firstDate.getMonth() &&
      dateValue.getFullYear() === firstDate.getFullYear(),
  );

  if (sameMonthYear) {
    const days = dates.map((dateValue) => dateValue.getDate()).join(",");
    const monthYear = firstDate.toLocaleDateString("en-US", {
      month: "short",
      year: "numeric",
    });
    return `${days} ${monthYear}`;
  }

  return dates
    .map((dateValue) =>
      dateValue.toLocaleDateString("en-US", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }),
    )
    .join(", ");
};

const AppointmentCard = ({
  appt,
  isClientView,
  activeTab,
  isProvider,
  displayAvatar,
  providerName,
  providerSpec,
  canCancel = true,
  cancelDisabledReason = "",
  handleConfirmAppointmentClick,
  handleCancelAppointment,
  handleCompleteClick,
  handleViewClick,
  handleAssignPetClick,
  downloadPrescription,
}) => {
  const selectedDates = Array.isArray(appt?.selectedDates)
    ? appt.selectedDates
        .map((dateValue) => new Date(dateValue))
        .filter((dateValue) => !Number.isNaN(dateValue.getTime()))
        .sort((left, right) => left.getTime() - right.getTime())
    : [];
  const requestedDateCandidates =
    selectedDates.length > 0
      ? selectedDates
      : [new Date(appt.date)].filter(
          (dateValue) => !Number.isNaN(dateValue.getTime()),
        );
  const requestedOnLabel = `Requested on ${formatCompactScheduleDates(requestedDateCandidates) || "N/A"}`;

  return (
    <div
      key={appt._id}
      className={styles.card}
      onClick={() => handleViewClick(appt)}
    >
      {/* Card Header */}
      <div className={styles.cardTop}>
        <div className={styles.providerInfo}>
          <img
            src={displayAvatar}
            alt={
              isClientView
                ? providerName
                : appt.userName || appt.user?.name || "Client"
            }
            className={styles.avatar}
            onError={(e) => {
              e.target.src = "https://via.placeholder.com/150";
            }}
          />
          <div className={styles.providerText}>
            <h4 className={styles.providerName}>
              {isClientView
                ? providerName
                : appt.userName || appt.user?.name || "Client"}
            </h4>
            <p className={styles.providerSpec}>{providerSpec}</p>
          </div>
        </div>
        <div className={styles.statusWrapper}>
          {appt.service === "others" && appt.providerType === "ngo" && (
            <span className={styles.rescueBadge}>Rescue</span>
          )}
          <span className={`${styles.statusBadge} ${styles[appt.status]}`}>
            {appt.status.charAt(0).toUpperCase() + appt.status.slice(1)}
          </span>
        </div>
      </div>

      {/* Card Body */}
      <div className={styles.cardBody}>
        <div className={styles.infoRow}>
          <Calendar size={16} className={styles.icon} />
          <span>{requestedOnLabel}</span>
        </div>
        <div className={styles.infoRow}>
          <Clock size={16} className={styles.icon} />
          <span>{formatTime(appt.time)}</span>
        </div>
        {appt.providerId?.address && isClientView && (
          <div className={styles.infoRow}>
            <MapPin size={16} className={styles.icon} />
            <span>{appt.providerId.address}</span>
          </div>
        )}

        {appt.status === "cancelled" && (
          <div className={styles.cancelReasonPreview}>
            <AlertTriangle size={14} className={styles.cancelReasonIcon} />
            <div className={styles.cancelDetails}>
              <span className={styles.cancelledByLabel}>
                Cancelled by:{" "}
                {appt.cancelledBy === "user" ? "User" : "Provider"}
              </span>
              {appt.cancellationReason && (
                <span className={styles.cancelReasonText}>
                  Reason: {appt.cancellationReason}
                </span>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Card Footer */}
      {((activeTab === "upcoming" &&
        ((isProvider && ["pending", "confirmed"].includes(appt.status)) ||
          (isClientView && appt.status === "pending"))) ||
        ((isClientView || isProvider) && appt.status === "completed")) && (
        <div className={styles.cardFooter}>
          {activeTab === "upcoming" && (
            <>
              {isProvider && appt.status !== "cancelled" && (
                <>
                  {appt.status === "pending" && (
                    <>
                      <Button
                        className={styles.btnPrimary}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleConfirmAppointmentClick(appt._id);
                        }}
                        variant="primary"
                        size="md"
                      >
                        <CheckCircle size={16} />
                        Confirm
                      </Button>
                      {canCancel && (
                        <Button
                          className={styles.btnCancel}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleCancelAppointment(appt);
                          }}
                          variant="ghost"
                          size="md"
                        >
                          <XCircle size={16} />
                          Cancel
                        </Button>
                      )}
                    </>
                  )}
                  {appt.status === "confirmed" && (
                    <>
                      <Button
                        className={styles.btnPrimary}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCompleteClick(appt);
                        }}
                        variant="primary"
                        size="md"
                      >
                        <CheckCircle size={16} />
                        Complete
                      </Button>
                    </>
                  )}
                </>
              )}
              {isClientView && appt.status === "pending" && (
                <Button
                  className={styles.btnCancel}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleCancelAppointment(appt);
                  }}
                  disabled={!canCancel}
                  title={!canCancel ? cancelDisabledReason : undefined}
                  variant="ghost"
                  size="md"
                >
                  <XCircle size={16} />
                  Cancel Appointment
                </Button>
              )}
            </>
          )}

          {(isClientView || isProvider) && appt.status === "completed" && (
              <Button
                className={styles.btnDownload}
                onClick={(e) => {
                  e.stopPropagation();
                  downloadPrescription(appt);
                }}
                variant="primary"
                size="md"
              >
                <Download size={16} />
                Download Receipt
              </Button>
            )}

          {isProvider &&
            appt.status === "completed" &&
            ["shop", "ngo"].includes(appt.providerType) &&
            appt.enquiryPetId?.available && (
              <Button
                className={styles.btnPrimary}
                onClick={(e) => {
                  e.stopPropagation();
                  handleAssignPetClick(appt);
                }}
                variant="primary"
                size="md"
              >
                <CheckCircle size={16} />
                Assign Pet to {appt.userName || appt.user?.name || "User"}
              </Button>
            )}
        </div>
      )}
    </div>
  );
};
export default AppointmentCard;

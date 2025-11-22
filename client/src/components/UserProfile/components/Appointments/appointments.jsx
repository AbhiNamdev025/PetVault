import React, { useState } from "react";
import styles from "./appointments.module.css";
import AppointmentCard from "./components/AppointmentCard/AppointmentCard";
import AppointmentModal from "./components/AppointmentModal/AppointmentModal";
import ConfirmationModal from "../../../ConfirmationModal/ConfirmationModal";
import { Calendar } from "lucide-react";

const Appointments = ({ list, onUpdateStatus, userRole }) => {
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [pendingAction, setPendingAction] = useState(null);

  const isServiceProvider = [
    "caretaker",
    "daycare",
    "doctor",
    "ngo",
    "hospital",
    "shop",
  ].includes(userRole);

  const handleStatusUpdate = async (appointmentId, newStatus) => {
    if (onUpdateStatus) {
      await onUpdateStatus(appointmentId, newStatus);
    }
    setShowConfirmation(false);
    setPendingAction(null);
  };

  const showConfirmationModal = (appointment, newStatus) => {
    setSelectedAppointment(appointment);
    setPendingAction({ appointmentId: appointment._id, newStatus });
    setShowConfirmation(true);
  };

  const getStatusConfig = (status) => {
    const configs = {
      confirmed: {
        title: "Confirm Appointment",
        message: "Are you sure you want to confirm this appointment?",
        confirmText: "Yes, Confirm",
        type: "confirm",
      },
      completed: {
        title: "Complete Appointment",
        message: "Mark this appointment as completed?",
        confirmText: "Yes, Complete",
        type: "complete",
      },
      cancelled: {
        title: "Cancel Appointment",
        message: "Are you sure you want to cancel this appointment?",
        confirmText: "Yes, Cancel",
        type: "cancel",
      },
    };
    return configs[status] || configs.cancelled;
  };

  return (
    <div className={styles.card}>
      <h3 className={styles.sectionTitle}>
        {isServiceProvider ? "Service Appointments" : "My Appointments"}
      </h3>

      {list.length === 0 ? (
        <div className={styles.emptyState}>
          <Calendar size={48} className={styles.emptyIcon} />
          <p>
            {isServiceProvider
              ? "No appointments assigned yet"
              : "No appointments scheduled yet"}
          </p>
          {!isServiceProvider && (
            <button
              className={styles.primaryButton}
              onClick={() => (window.location.href = "/book-appointment")}
            >
              Book Your First Appointment
            </button>
          )}
        </div>
      ) : (
        <div className={styles.appointmentsList}>
          {list.map((appointment) => (
            <AppointmentCard
              key={appointment._id}
              appointment={appointment}
              userRole={userRole}
              isServiceProvider={isServiceProvider}
              onViewDetails={() => {
                setSelectedAppointment(appointment);
                setShowDetails(true);
              }}
              onStatusChange={showConfirmationModal}
            />
          ))}
        </div>
      )}

      {showDetails && selectedAppointment && (
        <AppointmentModal
          appointment={selectedAppointment}
          isServiceProvider={isServiceProvider}
          onClose={() => setShowDetails(false)}
          onStatusChange={showConfirmationModal}
        />
      )}

      {showConfirmation && pendingAction && selectedAppointment && (
        <ConfirmationModal
          config={getStatusConfig(pendingAction.newStatus)}
          onConfirm={() =>
            handleStatusUpdate(
              pendingAction.appointmentId,
              pendingAction.newStatus
            )
          }
          onCancel={() => {
            setShowConfirmation(false);
            setPendingAction(null);
          }}
        />
      )}
    </div>
  );
};

export default Appointments;

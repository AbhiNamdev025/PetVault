import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { PawPrint, FileText } from "lucide-react";
import toast from "react-hot-toast";
import styles from "./appointmentsPage.module.css";
import { API_BASE_URL } from "../../utils/constants";
import AppointmentCard from "./components/AppointmentCard/AppointmentCard";
import AppointmentDetailsModal from "./AppointmentDetailsModal";
import {
  Button,
  EmptyState,
  Modal,
  PageContainer,
  Select,
  SectionHeader,
  Spinner,
} from "../common";

const AppointmentsPage = () => {
  const location = useLocation();
  const [appointments, setAppointments] = useState([]);
  const [filteredAppointments, setFilteredAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState("all");
  const [appointmentToCancel, setAppointmentToCancel] = useState(null);
  const [showCancelReasonModal, setShowCancelReasonModal] = useState(false);
  const [cancelReason, setCancelReason] = useState("");
  const [isCancelling, setIsCancelling] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);

  const fetchAppointments = async () => {
    try {
      const token =
        localStorage.getItem("token") || sessionStorage.getItem("token");
      const res = await fetch(`${API_BASE_URL}/appointments/my-appointments`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json();
      if (res.ok) {
        setAppointments(data);
        setFilteredAppointments(data);
      } else toast.error(data.message || "Failed to load appointments");
    } catch {
      toast.error("Unable to fetch appointments");
    } finally {
      setLoading(false);
    }
  };

  const confirmCancel = async () => {
    if (!appointmentToCancel) return;
    const trimmedReason = cancelReason.trim();

    if (trimmedReason.length < 10) {
      toast.error(
        "Please provide at least 10 characters as cancellation reason.",
      );
      return;
    }

    try {
      setIsCancelling(true);
      const token =
        localStorage.getItem("token") || sessionStorage.getItem("token");

      const res = await fetch(
        `${API_BASE_URL}/appointments/${appointmentToCancel}/status`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            status: "cancelled",
            cancellationReason: trimmedReason,
          }),
        },
      );

      const data = await res.json();

      if (res.ok) {
        setAppointments((prev) =>
          prev.map((a) =>
            a._id === appointmentToCancel ? { ...a, ...data } : a,
          ),
        );
        toast.info("Appointment cancelled");
      } else toast.error(data.message || "Failed to cancel");
    } catch {
      toast.error("Error cancelling appointment");
    } finally {
      setShowCancelReasonModal(false);
      setAppointmentToCancel(null);
      setCancelReason("");
      setIsCancelling(false);
    }
  };

  const handleCancelAppointment = (id) => {
    setAppointmentToCancel(id);
    setCancelReason("");
    setShowCancelReasonModal(true);
  };

  const handleViewDetails = (appointment) => {
    setSelectedAppointment(appointment);
    setShowDetailsModal(true);
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  useEffect(() => {
    if (
      location.state?.preserveModal &&
      location.state?.appointmentId &&
      appointments.length > 0
    ) {
      const appt = appointments.find(
        (a) => a._id === location.state.appointmentId,
      );
      if (appt) {
        setSelectedAppointment(appt);
        setShowDetailsModal(true);
      }
    }
  }, [location.state, appointments]);

  useEffect(() => {
    if (filterStatus === "all") setFilteredAppointments(appointments);
    else
      setFilteredAppointments(
        appointments.filter(
          (a) => a.status.toLowerCase() === filterStatus.toLowerCase(),
        ),
      );
  }, [filterStatus, appointments]);

  return (
    <PageContainer
      width="md"
      surface
      className={styles.appointmentsContainer}
    >
      <SectionHeader
        className={styles.header}
        icon={<PawPrint className={styles.headerIcon} />}
        title="My Appointments"
        subtitle="Manage your pet’s scheduled visits"
        actions={
          <Select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className={styles.filterSelect}
            options={[
              {
                label: "All Appointments",
                value: "all",
              },
              {
                label: "Pending",
                value: "pending",
              },
              {
                label: "Confirmed",
                value: "confirmed",
              },
              {
                label: "Completed",
                value: "completed",
              },
              {
                label: "Cancelled",
                value: "cancelled",
              },
            ]}
          />
        }
      />

      {loading ? (
        <Spinner
          className={styles.loaderBox}
          size="lg"
          label="Loading your appointments..."
        />
      ) : filteredAppointments.length === 0 ? (
        <EmptyState
          className={styles.emptyState}
          icon={<FileText size={60} className={styles.emptyIcon} />}
          title="No Appointments Found"
          description={`No ${
            filterStatus !== "all" ? filterStatus : ""
          } appointments to show.`}
        />
      ) : (
        <div className={styles.cardGrid}>
          {filteredAppointments.map((apt) => (
            <AppointmentCard
              key={apt._id}
              appointment={apt}
              onCancel={handleCancelAppointment}
              onClick={handleViewDetails}
            />
          ))}
        </div>
      )}
      <Modal
        isOpen={showCancelReasonModal}
        onClose={() => {
          if (isCancelling) return;
          setShowCancelReasonModal(false);
          setAppointmentToCancel(null);
          setCancelReason("");
        }}
        title="Cancel Appointment"
        size="md"
      >
        <div className={styles.cancelReasonWrap}>
          <p className={styles.cancelReasonHint}>
            Share a proper reason. This will be visible in appointment details.
          </p>
          <textarea
            className={styles.cancelReasonInput}
            rows={4}
            placeholder="Write cancellation reason..."
            value={cancelReason}
            onChange={(e) => setCancelReason(e.target.value)}
            maxLength={500}
            disabled={isCancelling}
          />
          <div className={styles.cancelReasonMeta}>
            {cancelReason.length}/500 (min 10)
          </div>
          <div className={styles.cancelReasonActions}>
            <Button
              variant="ghost"
              size="sm"
              className={styles.cancelReasonKeepBtn}
              onClick={() => {
                setShowCancelReasonModal(false);
                setAppointmentToCancel(null);
                setCancelReason("");
              }}
              disabled={isCancelling}
            >
              Keep Appointment
            </Button>
            <Button
              variant="danger"
              size="sm"
              className={styles.cancelReasonSubmitBtn}
              onClick={confirmCancel}
              disabled={isCancelling || cancelReason.trim().length < 10}
            >
              {isCancelling ? "Cancelling..." : "Cancel Appointment"}
            </Button>
          </div>
        </div>
      </Modal>

      {showDetailsModal && (
        <AppointmentDetailsModal
          isOpen={showDetailsModal}
          onClose={() => {
            setShowDetailsModal(false);
            setSelectedAppointment(null);
          }}
          appointment={selectedAppointment}
        />
      )}
    </PageContainer>
  );
};

export default AppointmentsPage;

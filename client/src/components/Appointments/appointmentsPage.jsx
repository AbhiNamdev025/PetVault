import React, { useEffect, useState } from "react";
import { PawPrint, FileText, Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import styles from "./appointmentsPage.module.css";
import { API_BASE_URL } from "../../utils/constants";
import AppointmentCard from "./Appointment Card/appointmentsCard";

const AppointmentsPage = () => {
  const [appointments, setAppointments] = useState([]);
  const [filteredAppointments, setFilteredAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState("all");

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

  const handleCancelAppointment = async (id) => {
    if (!window.confirm("Cancel this appointment?")) return;

    try {
      const token = localStorage.getItem("token");

      const res = await fetch(`${API_BASE_URL}/appointments/${id}/status`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: "cancelled" }),
      });

      const data = await res.json();

      if (res.ok) {
        setAppointments((prev) =>
          prev.map((a) => (a._id === id ? { ...a, status: "cancelled" } : a))
        );
        toast.info("Appointment cancelled");
      } else toast.error(data.message || "Failed to cancel");
    } catch {
      toast.error("Error cancelling appointment");
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  useEffect(() => {
    if (filterStatus === "all") setFilteredAppointments(appointments);
    else
      setFilteredAppointments(
        appointments.filter(
          (a) => a.status.toLowerCase() === filterStatus.toLowerCase()
        )
      );
  }, [filterStatus, appointments]);

  return (
    <div className={styles.appointmentsContainer}>
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <PawPrint className={styles.headerIcon} />
          <div>
            <h2 className={styles.title}>My Appointments</h2>
            <p className={styles.subtitle}>
              Manage your pet’s scheduled visits
            </p>
          </div>
        </div>

        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className={styles.filterSelect}
        >
          <option value="all">All Appointments</option>
          <option value="pending">Pending</option>
          <option value="confirmed">Confirmed</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      {loading ? (
        <div className={styles.loaderBox}>
          <Loader2 className={styles.spinner} />
          <p>Loading your appointments...</p>
        </div>
      ) : filteredAppointments.length === 0 ? (
        <div className={styles.emptyState}>
          <FileText size={60} className={styles.emptyIcon} />
          <h3>No Appointments Found</h3>
          <p>
            No {filterStatus !== "all" ? filterStatus : ""} appointments to
            show.
          </p>
        </div>
      ) : (
        <div className={styles.cardGrid}>
          {filteredAppointments.map((apt) => (
            <AppointmentCard
              key={apt._id}
              appointment={apt}
              onCancel={handleCancelAppointment}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default AppointmentsPage;

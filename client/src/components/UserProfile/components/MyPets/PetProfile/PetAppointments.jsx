import React, { useEffect, useState } from "react";
import styles from "./PetProfile.module.css";
import { API_BASE_URL } from "../../../../../utils/constants";

const PetAppointments = ({ petId }) => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        const token =
          localStorage.getItem("token") || sessionStorage.getItem("token");
        if (!token || !petId) return;
        const res = await fetch(
          `${API_BASE_URL}/appointments/pet-history/${petId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        );
        if (!res.ok) return;
        const data = await res.json();
        const history = Array.isArray(data?.history) ? data.history : [];
        const completedAppointments = history.filter(
          (appt) => String(appt?.status || "").toLowerCase() === "completed",
        );
        setAppointments(completedAppointments);
      } finally {
        setLoading(false);
      }
    };

    fetchAppointments();
  }, [petId]);

  if (loading) {
    return <div className={styles.empty}>Loading appointments…</div>;
  }

  if (!appointments.length) {
    return <div className={styles.empty}>No appointments yet.</div>;
  }

  return (
    <div className={styles.appointmentList}>
      {appointments.map((appt) => (
        <div key={appt._id} className={styles.appointmentItem}>
          <div className={styles.appointmentContent}>
            <p className={styles.appointmentDesc}>
              {appt.service.toUpperCase()} •{" "}
              {new Date(appt.date).toLocaleDateString("en-IN")}
            </p>
            <span className={styles.appointmentMeta}>
              {appt.providerId?.name || "Provider"} ·{" "}
              <span
                className={`${styles.appointmentStatusInline} ${
                  styles[
                    `appointmentStatus${String(appt.status || "")
                      .toLowerCase()
                      .replace(/\s+/g, "")}`
                  ] || ""
                }`}
              >
                {appt.status}
              </span>
            </span>
          </div>
          <span className={`${styles.status} ${styles[appt.status]}`}>
            {appt.status}
          </span>
        </div>
      ))}
    </div>
  );
};

export default PetAppointments;

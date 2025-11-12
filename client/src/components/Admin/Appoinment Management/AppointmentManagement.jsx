import React, { useEffect, useState } from "react";
import styles from "./appointmentManagement.module.css";
import { API_BASE_URL } from "../../../utils/constants";
import { toast } from "react-toastify";
import AppointmentCard from "./AppointmentCards/appointmentCard";
import DeleteConfirmationModal from "../DeleteConfirmationModal/deleteConfirmationModal";
import { Filter } from "lucide-react";

function AppointmentManagement() {
  const [appointments, setAppointments] = useState([]);
  const [filteredAppointments, setFilteredAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");
  const [serviceFilter, setServiceFilter] = useState("all");

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [appointmentToDelete, setAppointmentToDelete] = useState(null);

  const fetchAppointments = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE_URL}/appointments`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json();
      if (res.ok) {
        setAppointments(data);
        setFilteredAppointments(data);
      } else toast.error(data.message || "Failed to fetch appointments");
    } catch {
      toast.error("Error fetching appointments");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  const handleStatusUpdate = async (id, status) => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE_URL}/appointments/${id}/status`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status }),
      });

      const data = await res.json();
      if (res.ok) {
        setAppointments((prev) =>
          prev.map((a) => (a._id === id ? { ...a, status } : a))
        );
        setFilteredAppointments((prev) =>
          prev.map((a) => (a._id === id ? { ...a, status } : a))
        );
        toast.success(`Status updated to ${status}`);
      } else toast.error(data.message || "Failed to update status");
    } catch {
      toast.error("Error updating status");
    }
  };

  const handleDeleteAppointment = async () => {
    if (!appointmentToDelete) return;
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(
        `${API_BASE_URL}/appointments/${appointmentToDelete._id}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (res.ok) {
        setAppointments((prev) =>
          prev.filter((a) => a._id !== appointmentToDelete._id)
        );
        setFilteredAppointments((prev) =>
          prev.filter((a) => a._id !== appointmentToDelete._id)
        );
        toast.delete("Appointment deleted successfully");
        setShowDeleteModal(false);
      } else {
        toast.error("Failed to delete appointment");
      }
    } catch {
      toast.error("Error deleting appointment");
    }
  };

  const handleFilter = (status, service) => {
    setStatusFilter(status);
    setServiceFilter(service);
    let filtered = [...appointments];
    if (status !== "all")
      filtered = filtered.filter((a) => a.status === status);
    if (service !== "all")
      filtered = filtered.filter((a) => a.service === service);
    setFilteredAppointments(filtered);
  };

  if (loading)
    return <div className={styles.loading}>Loading appointments...</div>;

  return (
    <div className={styles.appointmentManagement}>
      <div className={styles.header}>
        <h1 className={styles.title}>Appointment Management</h1>

        <div className={styles.filters}>
          <div className={styles.filterGroup}>
            <Filter size={18} />
            <select
              value={statusFilter}
              onChange={(e) => handleFilter(e.target.value, serviceFilter)}
              className={styles.filterSelect}
            >
              <option value="all">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>

          <div className={styles.filterGroup}>
            <Filter size={18} />
            <select
              value={serviceFilter}
              onChange={(e) => handleFilter(statusFilter, e.target.value)}
              className={styles.filterSelect}
            >
              <option value="all">All Services</option>
              <option value="vet">Vet</option>
              <option value="daycare">Daycare</option>
              <option value="grooming">Grooming</option>
              <option value="training">Training</option>
              <option value="boarding">Boarding</option>
              <option value="others">Others</option>
            </select>
          </div>
        </div>
      </div>

      {filteredAppointments.length === 0 ? (
        <div className={styles.emptyState}>No Appointments Found</div>
      ) : (
        <div className={styles.grid}>
          {filteredAppointments.map((appointment) => (
            <AppointmentCard
              key={appointment._id}
              appointment={appointment}
              onStatusUpdate={handleStatusUpdate}
              onDelete={() => {
                setAppointmentToDelete(appointment);
                setShowDeleteModal(true);
              }}
            />
          ))}
        </div>
      )}

      {showDeleteModal && appointmentToDelete && (
        <DeleteConfirmationModal
          isOpen={showDeleteModal}
          onClose={() => setShowDeleteModal(false)}
          onConfirm={handleDeleteAppointment}
          itemType="appointment"
          itemName={appointmentToDelete.petName || "this appointment"}
        />
      )}
    </div>
  );
}

export default AppointmentManagement;

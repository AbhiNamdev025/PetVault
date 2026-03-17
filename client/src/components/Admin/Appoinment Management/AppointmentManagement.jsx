import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import styles from "./appointmentManagement.module.css";
import { API_BASE_URL } from "../../../utils/constants";
import toast from "react-hot-toast";
import DeleteConfirmationModal from "../DeleteConfirmationModal/deleteConfirmationModal";
import AppointmentDetailsModal from "../../Appointments/AppointmentDetailsModal";
import FilterSidebar from "../../common/FilterSidebar/FilterSidebar";
import AppointmentHeader from "./components/AppointmentHeader";
import AppointmentList from "./components/AppointmentList";
import { TableRowSkeleton } from "../../Skeletons";
import { Pagination } from "../../common";

function AppointmentManagement() {
  const location = useLocation();
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState("list"); // 'list' or 'details'
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    status: "all",
    service: "all",
    period: "all",
  });

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [appointmentToDelete, setAppointmentToDelete] = useState(null);

  const [selectedAppointment, setSelectedAppointment] = useState(null);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const fetchAppointments = async () => {
    try {
      const token =
        localStorage.getItem("token") || sessionStorage.getItem("token");
      if (!token) {
        toast.error("Please login again");
        setLoading(false);
        return;
      }
      const res = await fetch(`${API_BASE_URL}/appointments`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json();
      if (res.ok) {
        setAppointments(data);
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

  useEffect(() => {
    if (
      (location.state?.restoreAppt ||
        location.state?.preserveModal ||
        location.state?.appointmentId) &&
      location.state?.appointmentId &&
      appointments.length > 0 &&
      !selectedAppointment
    ) {
      const appt = appointments.find(
        (a) => a._id === location.state.appointmentId,
      );
      if (appt) {
        setSelectedAppointment(appt);
        setView("details");
        // Clear restore flags
        navigate(location.pathname + location.search, {
          replace: true,
          state: {
            ...location.state,
            restoreAppt: false,
            preserveModal: false,
            appointmentId: null,
          },
        });
      }
    }
  }, [
    location.state,
    appointments,
    selectedAppointment,
    navigate,
    location.pathname,
    location.search,
  ]);

  useEffect(() => {
    setCurrentPage(1);
  }, [filters]);

  const handleStatusUpdate = async (id, status) => {
    try {
      const token =
        localStorage.getItem("token") || sessionStorage.getItem("token");
      if (!token) {
        toast.error("Please login again");
        return;
      }
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
          prev.map((a) => (a._id === id ? { ...a, status } : a)),
        );
        if (selectedAppointment && selectedAppointment._id === id) {
          setSelectedAppointment({ ...selectedAppointment, status });
        }
        toast.success(`Status updated to ${status}`);
      } else toast.error(data.message || "Failed to update status");
    } catch {
      toast.error("Error updating status");
    }
  };

  const handleDeleteAppointment = async () => {
    const id = appointmentToDelete?._id;
    if (!id) return;
    try {
      const token =
        localStorage.getItem("token") || sessionStorage.getItem("token");
      if (!token) {
        toast.error("Please login again");
        return;
      }
      const res = await fetch(`${API_BASE_URL}/appointments/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        setAppointments((prev) => prev.filter((a) => a._id !== id));
        toast.success("Appointment deleted successfully");
        setShowDeleteModal(false);
        if (selectedAppointment?._id === id) {
          setView("list");
          setSelectedAppointment(null);
        }
      } else {
        toast.error("Failed to delete appointment");
      }
    } catch {
      toast.error("Error deleting appointment");
    }
  };

  const filteredAppointments = React.useMemo(() => {
    let result = appointments;
    if (filters.status !== "all") {
      result = result.filter((a) => a.status === filters.status);
    }
    if (filters.service !== "all") {
      result = result.filter((a) => a.service === filters.service);
    }
    if (filters.period !== "all") {
      const now = new Date();
      const start = new Date(now);
      switch (filters.period) {
        case "today":
          start.setHours(0, 0, 0, 0);
          break;
        case "week": {
          const day = now.getDay();
          const diff = day === 0 ? 6 : day - 1;
          start.setDate(now.getDate() - diff);
          start.setHours(0, 0, 0, 0);
          break;
        }
        case "month":
          start.setDate(1);
          start.setHours(0, 0, 0, 0);
          break;
        default:
          break;
      }
      result = result.filter((a) => new Date(a.createdAt) >= start);
    }
    return result;
  }, [appointments, filters]);

  const handleViewDetails = (appointment) => {
    setSelectedAppointment(appointment);
    setView("details");
  };

  const handleBackToList = () => {
    setView("list");
    setSelectedAppointment(null);
  };

  const triggerDelete = (appointment) => {
    setAppointmentToDelete(appointment);
    setShowDeleteModal(true);
  };

  if (loading) return <TableRowSkeleton rows={5} columns={5} />;

  const hasActiveFilters =
    filters.status !== "all" ||
    filters.service !== "all" ||
    filters.period !== "all";

  const filterOptions = [
    {
      id: "status",
      label: "Status",
      values: [
        { id: "all", label: "All Statuses" },
        { id: "pending", label: "Pending" },
        { id: "confirmed", label: "Confirmed" },
        { id: "completed", label: "Completed" },
        { id: "cancelled", label: "Cancelled" },
      ],
    },
    {
      id: "service",
      label: "Service Type",
      values: [
        { id: "all", label: "All Services" },
        { id: "vet", label: "Vet" },
        { id: "daycare", label: "Daycare" },
        { id: "shop", label: "Shop" },
        { id: "others", label: "NGO" },
      ],
    },
    {
      id: "period",
      label: "Time Period",
      values: [
        { id: "all", label: "All Time" },
        { id: "today", label: "Today" },
        { id: "week", label: "This Week" },
        { id: "month", label: "This Month" },
      ],
    },
  ];

  return (
    <div className={styles.appointmentManagement}>
      <FilterSidebar
        isOpen={showFilters}
        onClose={() => setShowFilters(false)}
        filters={filters}
        setFilters={setFilters}
        options={filterOptions}
        onReset={() =>
          setFilters({ status: "all", service: "all", period: "all" })
        }
        showSearch={false}
      />
      {view === "list" ? (
        <>
          <AppointmentHeader
            onOpenFilters={() => setShowFilters(true)}
            hasActiveFilters={hasActiveFilters}
          />

          <AppointmentList
            appointments={filteredAppointments.slice(
              (currentPage - 1) * itemsPerPage,
              currentPage * itemsPerPage,
            )}
            onStatusUpdate={handleStatusUpdate}
            onViewDetails={handleViewDetails}
            onDelete={triggerDelete}
          />

          <Pagination
            currentPage={currentPage}
            totalPages={Math.ceil(filteredAppointments.length / itemsPerPage)}
            onPageChange={setCurrentPage}
            showPageInfo={true}
            className={styles.pagination}
          />
        </>
      ) : (
        <AppointmentDetailsModal
          appointment={selectedAppointment}
          onBack={handleBackToList}
          onStatusUpdate={handleStatusUpdate}
          onDelete={() => triggerDelete(selectedAppointment)}
          viewMode="admin"
        />
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

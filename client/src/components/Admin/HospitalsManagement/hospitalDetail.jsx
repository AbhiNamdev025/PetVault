import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { API_BASE_URL, BASE_URL } from "../../../utils/constants";
import styles from "./hospitalDetail.module.css";
import toast from "react-hot-toast";
import ConfirmationModal from "../../ConfirmationModal/ConfirmationModal";
import HospitalTopBar from "./components/HospitalTopBar";
import HospitalHeader from "./components/HospitalHeader";
import HospitalStatsGrid from "./components/HospitalStatsGrid";
import DoctorsSection from "./components/DoctorsSection";

const HospitalDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [hospitalData, setHospitalData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeMenuId, setActiveMenuId] = useState(null);
  const [showArchiveModal, setShowArchiveModal] = useState(false);
  const [itemToArchive, setItemToArchive] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchHospitalDetails();
  }, [id]);

  const fetchHospitalDetails = async () => {
    try {
      const token =
        localStorage.getItem("token") || sessionStorage.getItem("token");
      const response = await fetch(`${API_BASE_URL}/admin/hospitals/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        setHospitalData(data);
      }
    } catch (error) {
      console.error("Error fetching hospital details:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleArchive = async () => {
    if (!itemToArchive) return;
    setActionLoading(true);
    try {
      const token = localStorage.getItem("token") || sessionStorage.getItem("token");
      const response = await fetch(
        `${API_BASE_URL}/admin/users/${itemToArchive._id}/archive`,
        {
          method: "PUT",
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      if (response.ok) {
        toast.success(
          itemToArchive.isArchived
            ? "Doctor restored successfully"
            : "Doctor archived successfully",
        );
        fetchHospitalDetails();
      } else {
        toast.error("Failed to update status");
      }
    } catch (error) {
      toast.error("Error updating status");
    } finally {
      setActionLoading(false);
      setShowArchiveModal(false);
      setItemToArchive(null);
    }
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>Loading hospital details...</div>
      </div>
    );
  }

  if (!hospitalData) {
    return (
      <div className={styles.container}>
        <div className={styles.error}>Hospital not found</div>
      </div>
    );
  }

  const { hospital, doctors, analytics } = hospitalData;
  const doctorList = doctors?.list || [];
  const totalAppointments = analytics?.total_appointments || 0;

  return (
    <div className={styles.container} onClick={() => setActiveMenuId(null)}>
      <HospitalTopBar onBack={() => navigate("/admin/tenants")} />

      <HospitalHeader
        hospital={hospital}
        onAccountActions={() => navigate(`/admin/tenants/${id}`)}
      />

      <HospitalStatsGrid
        hospital={hospital}
        doctorCount={doctorList.length}
        archivedCount={doctorList.filter((d) => d.isArchived).length}
        totalAppointments={totalAppointments}
        pendingAppointments={analytics?.pending || 0}
      />

      <DoctorsSection
        doctors={doctorList}
        baseUrl={BASE_URL}
        onRowClick={(doctor) => navigate(`/admin/tenants/${doctor._id}`)}
      />

      {showArchiveModal && itemToArchive && (
        <ConfirmationModal
          config={{
            title: itemToArchive.isArchived
              ? "Restore Doctor?"
              : "Archive Doctor?",
            message: `Are you sure you want to ${itemToArchive.isArchived ? "restore" : "archive"} ${itemToArchive.name}?`,
            confirmText: "Yes, Proceed",
            type: "confirm",
          }}
          onConfirm={handleToggleArchive}
          onCancel={() => setShowArchiveModal(false)}
          isLoading={actionLoading}
        />
      )}
    </div>
  );
};

export default HospitalDetail;

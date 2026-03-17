import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { API_BASE_URL, BASE_URL } from "../../../utils/constants";
import styles from "./daycareDetail.module.css";
import toast from "react-hot-toast";
import ConfirmationModal from "../../ConfirmationModal/ConfirmationModal";
import DaycareTopBar from "./components/DaycareTopBar";
import DaycareHeader from "./components/DaycareHeader";
import DaycareStatsGrid from "./components/DaycareStatsGrid";
import CaretakersSection from "./components/CaretakersSection";

const DaycareDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [daycareData, setDaycareData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeMenuId, setActiveMenuId] = useState(null);
  const [showArchiveModal, setShowArchiveModal] = useState(false);
  const [itemToArchive, setItemToArchive] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchDaycareDetails();
  }, [id]);

  const fetchDaycareDetails = async () => {
    try {
      const token =
        localStorage.getItem("token") || sessionStorage.getItem("token");
      const response = await fetch(`${API_BASE_URL}/admin/daycares/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        setDaycareData(data);
      }
    } catch (error) {
      console.error("Error fetching daycare details:", error);
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
            ? "Caretaker restored successfully"
            : "Caretaker archived successfully",
        );
        fetchDaycareDetails();
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
        <div className={styles.loading}>Loading daycare details...</div>
      </div>
    );
  }

  if (!daycareData) {
    return (
      <div className={styles.container}>
        <div className={styles.error}>Daycare not found</div>
      </div>
    );
  }

  const { daycare, caretakers } = daycareData;
  const caretakerList = caretakers?.list || [];

  return (
    <div className={styles.container} onClick={() => setActiveMenuId(null)}>
      <DaycareTopBar onBack={() => navigate("/admin/tenants")} />

      <DaycareHeader
        daycare={daycare}
        onAccountActions={() => navigate(`/admin/tenants/${id}`)}
      />

      <DaycareStatsGrid
        daycare={daycare}
        caretakerCount={caretakerList.length}
        archivedCount={caretakerList.filter((c) => c.isArchived).length}
      />

      <CaretakersSection
        caretakers={caretakerList}
        baseUrl={BASE_URL}
        onRowClick={(caretaker) => navigate(`/admin/tenants/${caretaker._id}`)}
      />

      {showArchiveModal && itemToArchive && (
        <ConfirmationModal
          config={{
            title: itemToArchive.isArchived
              ? "Restore Caretaker?"
              : "Archive Caretaker?",
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

export default DaycareDetail;

import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { API_BASE_URL, BASE_URL } from "../../../utils/constants";
import styles from "./ngoDetail.module.css";
import toast from "react-hot-toast";
import ConfirmationModal from "../../ConfirmationModal/ConfirmationModal";
import DeletionReasonModal from "../DeletionReasonModal/deletionReasonModal";
import NgoTopBar from "./components/NgoTopBar";
import NgoHeader from "./components/NgoHeader";
import NgoStatsGrid from "./components/NgoStatsGrid";
import NgoTabs from "./components/NgoTabs";
import PetsTable from "./components/PetsTable";

const NgoDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [ngoData, setNgoData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Models State
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);

  const [showRestoreModal, setShowRestoreModal] = useState(false);
  const [itemToRestore, setItemToRestore] = useState(null);
  const [activeMenuId, setActiveMenuId] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchNgoDetails();
  }, [id]);

  const fetchNgoDetails = async () => {
    try {
      const token =
        localStorage.getItem("token") || sessionStorage.getItem("token");
      const response = await fetch(`${API_BASE_URL}/admin/ngos/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        setNgoData(data);
      } else {
        toast.error("Failed to fetch NGO details");
      }
    } catch (error) {
      console.error("Error fetching NGO details:", error);
    } finally {
      setLoading(false);
    }
  };

  // --- Actions ---

  const handleView = (petId) => {
    navigate(`/admin/pets/${petId}`);
  };

  const handleDeleteClick = (pet) => {
    setItemToDelete(pet);
    setShowDeleteModal(true);
    setActiveMenuId(null);
  };

  const handleRestoreClick = (pet) => {
    setItemToRestore(pet);
    setShowRestoreModal(true);
    setActiveMenuId(null);
  };

  const confirmDelete = async (reason) => {
    if (!itemToDelete) return;
    setActionLoading(true);
    try {
      const token = localStorage.getItem("token") || sessionStorage.getItem("token");
      const endpoint = `${API_BASE_URL}/pets/${itemToDelete._id}`;

      const res = await fetch(endpoint, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ deletion_reason: reason }),
      });

      const data = await res.json();
      if (res.ok) {
        toast.success("Pet deleted successfully");
        fetchNgoDetails();
      } else {
        toast.error(data.message || "Failed to delete");
      }
    } catch (error) {
      toast.error("Error performing deletion");
    } finally {
      setActionLoading(false);
      setShowDeleteModal(false);
      setItemToDelete(null);
    }
  };

  const confirmRestore = async () => {
    if (!itemToRestore) return;
    setActionLoading(true);
    try {
      const token = localStorage.getItem("token") || sessionStorage.getItem("token");
      const endpoint = `${API_BASE_URL}/pets/${itemToRestore._id}/restore`;

      const res = await fetch(endpoint, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        toast.success("Pet restored successfully");
        fetchNgoDetails();
      } else {
        toast.error("Failed to restore");
      }
    } catch (error) {
      toast.error("Error performing restore");
    } finally {
      setActionLoading(false);
      setShowRestoreModal(false);
      setItemToRestore(null);
    }
  };

  if (loading)
    return <div className={styles.loading}>Loading NGO details...</div>;
  if (!ngoData) return <div className={styles.error}>NGO not found</div>;

  const { ngo, pets } = ngoData;

  const handleToggleMenu = (petId) => {
    setActiveMenuId((prev) => (prev === petId ? null : petId));
  };

  return (
    <div className={styles.pageContainer} onClick={() => setActiveMenuId(null)}>
      <NgoTopBar onBack={() => navigate("/admin/tenants")} />

      <div className={styles.mainContent}>
        <NgoHeader
          ngo={ngo}
          onAccountActions={() => navigate(`/admin/tenants/${id}`)}
        />

        <NgoStatsGrid ngo={ngo} pets={pets} />

        <NgoTabs petCount={pets.count} />

        <PetsTable
          pets={pets.items}
          baseUrl={BASE_URL}
          activeMenuId={activeMenuId}
          onToggleMenu={handleToggleMenu}
          onView={handleView}
          onDelete={handleDeleteClick}
          onRestore={handleRestoreClick}
        />
      </div>

      {showDeleteModal && itemToDelete && (
        <DeletionReasonModal
          isOpen={showDeleteModal}
          onClose={() => setShowDeleteModal(false)}
          onConfirm={confirmDelete}
          itemType="pet"
          itemName={itemToDelete.name}
        />
      )}

      {showRestoreModal && itemToRestore && (
        <ConfirmationModal
          config={{
            title: "Restore Pet?",
            message: `Are you sure you want to restore "${itemToRestore.name}"? This will make it visible again.`,
            confirmText: "Yes, Restore",
            type: "confirm",
          }}
          onConfirm={confirmRestore}
          onCancel={() => setShowRestoreModal(false)}
          isLoading={actionLoading}
        />
      )}
    </div>
  );
};

export default NgoDetail;

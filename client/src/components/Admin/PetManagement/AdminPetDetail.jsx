import React, { useEffect, useState } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { API_BASE_URL, BASE_URL } from "../../../utils/constants";
import toast from "react-hot-toast";
import ConfirmationModal from "../../ConfirmationModal/ConfirmationModal";
import DeletionReasonModal from "../DeletionReasonModal/deletionReasonModal";
import styles from "./AdminPetDetail.module.css";
import AdminPetTopBar from "./components/AdminPetTopBar";
import AdminPetHeader from "./components/AdminPetHeader";
import AdminPetDetailsGrid from "./components/AdminPetDetailsGrid";
import AdminPetGallery from "./components/AdminPetGallery";

const AdminPetDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [pet, setPet] = useState(null);
  const [loading, setLoading] = useState(true);

  // Actions State
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showRestoreModal, setShowRestoreModal] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchPetDetails();
  }, [id]);

  const fetchPetDetails = async () => {
    try {
      const token =
        localStorage.getItem("token") || sessionStorage.getItem("token");
      const response = await fetch(`${API_BASE_URL}/admin/pets/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        setPet(data);
      } else {
        toast.error("Failed to fetch pet details");
      }
    } catch (error) {
      console.error("Error fetching pet:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (type, reason = "") => {
    setActionLoading(true);
    try {
      const token = localStorage.getItem("token") || sessionStorage.getItem("token");
      let endpoint = `${API_BASE_URL}/pets/${id}`;
      let method = "DELETE";
      let body = JSON.stringify({ deletion_reason: reason });

      if (type === "restore") {
        endpoint = `${API_BASE_URL}/pets/${id}/restore`;
        method = "PUT";
        body = null;
      }

      const res = await fetch(endpoint, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: body,
      });

      if (res.ok) {
        toast.success(
          `Pet ${type === "delete" ? "deleted" : "restored"} successfully`,
        );
        fetchPetDetails();
      } else {
        const data = await res.json();
        toast.error(data.message || "Action failed");
      }
    } catch (error) {
      toast.error("Error performing action");
    } finally {
      setActionLoading(false);
      setShowDeleteModal(false);
      setShowRestoreModal(false);
    }
  };

  if (loading)
    return <div className={styles.loading}>Loading pet details...</div>;
  if (!pet) return <div className={styles.error}>Pet not found</div>;

  return (
    <div className={styles.pageContainer}>
      <AdminPetTopBar
        onBack={() => {
          if (location.state?.from) {
            navigate(location.state.from, { state: location.state });
          } else {
            navigate(-1);
          }
        }}
      />

      <div className={styles.mainContent}>
        <AdminPetHeader
          pet={pet}
          onDelete={() => setShowDeleteModal(true)}
          onRestore={() => setShowRestoreModal(true)}
          onNavigateToTenant={(tenantId) =>
            navigate(`/admin/tenants/${tenantId}`)
          }
        />

        <AdminPetDetailsGrid pet={pet} />

        <AdminPetGallery images={pet.images || []} baseUrl={BASE_URL} />
      </div>

      {showDeleteModal && (
        <DeletionReasonModal
          isOpen={showDeleteModal}
          onClose={() => setShowDeleteModal(false)}
          onConfirm={(reason) => handleAction("delete", reason)}
          itemType="pet"
          itemName={pet.name}
        />
      )}

      {showRestoreModal && (
        <ConfirmationModal
          config={{
            title: "Restore Pet?",
            message: "This will make the pet listing visible again.",
            confirmText: "Yes, Restore",
            type: "confirm",
          }}
          onConfirm={() => handleAction("restore")}
          onCancel={() => setShowRestoreModal(false)}
          isLoading={actionLoading}
        />
      )}
    </div>
  );
};

export default AdminPetDetail;

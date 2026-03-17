import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { API_BASE_URL, BASE_URL } from "../../../utils/constants";
import toast from "react-hot-toast";
import ConfirmationModal from "../../ConfirmationModal/ConfirmationModal";
import DeletionReasonModal from "../DeletionReasonModal/deletionReasonModal";
import styles from "./AdminProductDetail.module.css";
import AdminProductTopBar from "./components/AdminProductTopBar";
import AdminProductHeader from "./components/AdminProductHeader";
import AdminProductDetailsGrid from "./components/AdminProductDetailsGrid";
import AdminProductGallery from "./components/AdminProductGallery";

const AdminProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);

  // Actions State
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showRestoreModal, setShowRestoreModal] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchProductDetails();
  }, [id]);

  const fetchProductDetails = async () => {
    try {
      const token = localStorage.getItem("token") || sessionStorage.getItem("token");
      const response = await fetch(`${API_BASE_URL}/admin/products/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        setProduct(data);
      } else {
        toast.error("Failed to fetch product details");
      }
    } catch (error) {
      console.error("Error fetching product:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (type, reason = "") => {
    setActionLoading(true);
    try {
      const token = localStorage.getItem("token") || sessionStorage.getItem("token");
      let endpoint = `${API_BASE_URL}/products/${id}`;
      let method = "DELETE";
      let body = JSON.stringify({ deletion_reason: reason });

      if (type === "restore") {
        endpoint = `${API_BASE_URL}/products/${id}/restore`;
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
          `Product ${type === "delete" ? "deleted" : "restored"} successfully`,
        );
        fetchProductDetails();
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
    return <div className={styles.loading}>Loading product details...</div>;
  if (!product) return <div className={styles.error}>Product not found</div>;

  return (
    <div className={styles.pageContainer}>
      <AdminProductTopBar onBack={() => navigate(-1)} />

      <div className={styles.mainContent}>
        <AdminProductHeader
          product={product}
          onDelete={() => setShowDeleteModal(true)}
          onRestore={() => setShowRestoreModal(true)}
          onNavigateToTenant={(tenantId) =>
            navigate(`/admin/tenants/${tenantId}`)
          }
        />

        <AdminProductDetailsGrid product={product} />

        <AdminProductGallery
          images={product.images || []}
          baseUrl={BASE_URL}
        />
      </div>

      {showDeleteModal && (
        <DeletionReasonModal
          isOpen={showDeleteModal}
          onClose={() => setShowDeleteModal(false)}
          onConfirm={(reason) => handleAction("delete", reason)}
          itemType="product"
          itemName={product.name}
        />
      )}

      {showRestoreModal && (
        <ConfirmationModal
          config={{
            title: "Restore Product?",
            message: "This will make the product visible again in the shop.",
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

export default AdminProductDetail;

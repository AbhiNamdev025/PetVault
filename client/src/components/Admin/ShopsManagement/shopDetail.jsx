import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { API_BASE_URL } from "../../../utils/constants";
import styles from "./shopDetail.module.css";
import toast from "react-hot-toast";
import ConfirmationModal from "../../ConfirmationModal/ConfirmationModal";
import DeletionReasonModal from "../DeletionReasonModal/deletionReasonModal";
import ShopTopBar from "./components/ShopTopBar";
import ShopHeader from "./components/ShopHeader";
import ShopStatsGrid from "./components/ShopStatsGrid";
import ShopTabs from "./components/ShopTabs";
import ProductsTable from "./components/ProductsTable";
import PetsTable from "./components/PetsTable";

const ShopDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [shopData, setShopData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("products");
  const [activeMenuId, setActiveMenuId] = useState(null);

  // Modals state
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [showRestoreModal, setShowRestoreModal] = useState(false);
  const [itemToRestore, setItemToRestore] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchShopDetails();
  }, [id]);

  const fetchShopDetails = async () => {
    try {
      const token =
        localStorage.getItem("token") || sessionStorage.getItem("token");
      const response = await fetch(`${API_BASE_URL}/admin/shops/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        setShopData(data);
      }
    } catch (error) {
      console.error("Error fetching shop details:", error);
    } finally {
      setLoading(false);
    }
  };

  // --- Actions ---

  const handleDeleteClick = (item, type) => {
    setItemToDelete({ ...item, type });
    setShowDeleteModal(true);
    setActiveMenuId(null);
  };

  const handleRestoreClick = (item, type) => {
    setItemToRestore({ ...item, type });
    setShowRestoreModal(true);
    setActiveMenuId(null);
  };

  const confirmDelete = async (reason) => {
    if (!itemToDelete) return;
    setActionLoading(true);
    try {
      const token = localStorage.getItem("token") || sessionStorage.getItem("token");
      const type = itemToDelete.type === "product" ? "products" : "pets";
      const endpoint = `${API_BASE_URL}/${type}/${itemToDelete._id}`;

      const res = await fetch(endpoint, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ deletion_reason: reason }),
      });

      if (res.ok) {
        toast.success(
          `${itemToDelete.type.charAt(0).toUpperCase() + itemToDelete.type.slice(1)} deleted successfully`,
        );
        fetchShopDetails();
      } else {
        const data = await res.json();
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
      const type = itemToRestore.type === "product" ? "products" : "pets";
      const endpoint = `${API_BASE_URL}/${type}/${itemToRestore._id}/restore`;

      const res = await fetch(endpoint, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        toast.success(
          `${itemToRestore.type.charAt(0).toUpperCase() + itemToRestore.type.slice(1)} restored successfully`,
        );
        fetchShopDetails();
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

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>Loading shop details...</div>
      </div>
    );
  }

  if (!shopData) {
    return (
      <div className={styles.container}>
        <div className={styles.error}>Shop not found</div>
      </div>
    );
  }

  const { shop, products, pets } = shopData;
  const baseUrl = API_BASE_URL.replace("/api", "");

  const handleToggleMenu = (itemId) => {
    setActiveMenuId((prev) => (prev === itemId ? null : itemId));
  };

  return (
    <div className={styles.container} onClick={() => setActiveMenuId(null)}>
      <ShopTopBar onBack={() => navigate("/admin/tenants")} />

      <ShopHeader
        shop={shop}
        onAccountActions={() => navigate(`/admin/tenants/${id}`)}
      />

      <ShopStatsGrid shop={shop} products={products} pets={pets} />

      <ShopTabs
        activeTab={activeTab}
        onTabChange={setActiveTab}
        productsCount={products.count}
        petsCount={pets.count}
      />

      <div className={styles.tabContent}>
        {activeTab === "products" && (
          <ProductsTable
            products={products.items}
            baseUrl={baseUrl}
            activeMenuId={activeMenuId}
            onToggleMenu={handleToggleMenu}
            onView={(product) => navigate(`/admin/products/${product._id}`)}
            onDelete={(product) => handleDeleteClick(product, "product")}
            onRestore={(product) => handleRestoreClick(product, "product")}
          />
        )}

        {activeTab === "pets" && (
          <PetsTable
            pets={pets.items}
            baseUrl={baseUrl}
            activeMenuId={activeMenuId}
            onToggleMenu={handleToggleMenu}
            onView={(pet) => navigate(`/admin/pets/${pet._id}`)}
            onDelete={(pet) => handleDeleteClick(pet, "pet")}
            onRestore={(pet) => handleRestoreClick(pet, "pet")}
          />
        )}
      </div>

      {showDeleteModal && itemToDelete && (
        <DeletionReasonModal
          isOpen={showDeleteModal}
          onClose={() => setShowDeleteModal(false)}
          onConfirm={confirmDelete}
          itemType={itemToDelete.type}
          itemName={itemToDelete.name || itemToDelete.product_name}
        />
      )}

      {showRestoreModal && itemToRestore && (
        <ConfirmationModal
          config={{
            title: `Restore ${itemToRestore.type === "product" ? "Product" : "Pet"}?`,
            message: `Are you sure you want to restore "${itemToRestore.name || itemToRestore.product_name}"? This will make it visible again.`,
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

export default ShopDetail;

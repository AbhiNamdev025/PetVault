import React, { useState, useEffect } from "react";
import toast from "react-hot-toast";
import DeletionReasonModal from "../DeletionReasonModal/deletionReasonModal";
import ConfirmationModal from "../../ConfirmationModal/ConfirmationModal";
import styles from "./petManagement.module.css";
import { API_BASE_URL, BASE_URL } from "../../../utils/constants";
import { useNavigate } from "react-router-dom";
import PetHeader from "./components/PetHeader";
import PetGrid from "./components/PetGrid";

const PetManagement = () => {
  const [pets, setPets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [petToDelete, setPetToDelete] = useState(null);

  const [showRestoreModal, setShowRestoreModal] = useState(false);
  const [petToRestore, setPetToRestore] = useState(null);
  const [restoreLoading, setRestoreLoading] = useState(false);

  const [filterType, setFilterType] = useState("all");
  const [filterCategory, setFilterCategory] = useState("all");
  const [filterAvailability, setFilterAvailability] = useState("all");
  const [viewMode, setViewMode] = useState("active");
  const navigate = useNavigate();

  useEffect(() => {
    fetchPets();
  }, [viewMode]);

  const fetchPets = async () => {
    setLoading(true);
    try {
      const token =
        localStorage.getItem("token") || sessionStorage.getItem("token");
      const response = await fetch(`${API_BASE_URL}/pets?status=${viewMode}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setPets(data.pets || []);
      }
    } catch (error) {
      toast.error("Failed to fetch pets");
    } finally {
      setLoading(false);
    }
  };

  const handleRestoreClick = (pet) => {
    setPetToRestore(pet);
    setShowRestoreModal(true);
  };

  const confirmRestore = async () => {
    if (!petToRestore) return;
    setRestoreLoading(true);
    try {
      const token =
        localStorage.getItem("token") || sessionStorage.getItem("token");
      const res = await fetch(
        `${API_BASE_URL}/pets/${petToRestore._id}/restore`,
        {
          method: "PUT",
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      if (res.ok) {
        toast.success("Pet restored successfully");
        setShowRestoreModal(false);
        setPetToRestore(null);
        fetchPets();
      } else {
        toast.error("Failed to restore pet");
      }
    } catch {
      toast.error("Error restoring pet");
    } finally {
      setRestoreLoading(false);
    }
  };

  const handleDeleteClick = (pet) => {
    setPetToDelete(pet);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async (deletionReason) => {
    if (!petToDelete) return;

    try {
      const token =
        localStorage.getItem("token") || sessionStorage.getItem("token");
      const response = await fetch(`${API_BASE_URL}/pets/${petToDelete._id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ deletion_reason: deletionReason }),
      });

      const data = await response.json();

      if (response.ok) {
        if (data.email_queued) {
          toast.success(
            "Pet deleted successfully. Owner will be notified via email.",
          );
        } else {
          toast.success("Pet deleted successfully");
        }
        setShowDeleteModal(false);
        setPetToDelete(null);
        fetchPets();
      } else {
        toast.error(data.message || "Failed to delete pet");
        throw new Error(data.message || "Failed to delete pet");
      }
    } catch (error) {
      toast.error(error.message || "Failed to delete pet");
      throw error;
    }
  };

  const handleDeleteCancel = () => {
    setShowDeleteModal(false);
    setPetToDelete(null);
  };

  const filteredPets = pets
    .filter((pet) => {
      const matchesType = filterType === "all" || pet.type === filterType;
      const matchesCategory =
        filterCategory === "all" || pet.category === filterCategory;
      const matchesAvailability =
        filterAvailability === "all" ||
        (filterAvailability === "available" && pet.available) ||
        (filterAvailability === "sold" && !pet.available);
      return matchesType && matchesCategory && matchesAvailability;
    })
    .sort((a, b) => {
      if (a.available === b.available) return 0;
      return a.available ? -1 : 1;
    });

  const handleViewPet = (pet) => {
    const path =
      pet.category === "shop"
        ? `/shop-pets/${pet._id}`
        : `/adopt-pets/${pet._id}`;

    const newTab = window.open(path, "_blank"); // Opens new Tab
    if (newTab) newTab.focus();
  };

  const handleCardClick = (pet) => {
    navigate(`/admin/pets/${pet._id}`);
  };

  const handleShopClick = (pet) => {
    const shopId = typeof pet.shopId === "object" ? pet.shopId._id : pet.shopId;
    navigate(`/admin/tenants/${shopId}`);
  };

  if (loading) {
    return <div className={styles.loading}>Loading pets...</div>;
  }

  return (
    <div className={styles.petManagement}>
      <PetHeader
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        filterType={filterType}
        onFilterTypeChange={setFilterType}
        filterCategory={filterCategory}
        onFilterCategoryChange={setFilterCategory}
        filterAvailability={filterAvailability}
        onFilterAvailabilityChange={setFilterAvailability}
      />

      <PetGrid
        pets={filteredPets}
        viewMode={viewMode}
        baseUrl={BASE_URL}
        onCardClick={handleCardClick}
        onView={handleViewPet}
        onDelete={handleDeleteClick}
        onRestore={handleRestoreClick}
        onShopClick={handleShopClick}
      />

      {showDeleteModal && petToDelete && (
        <DeletionReasonModal
          isOpen={showDeleteModal}
          onClose={handleDeleteCancel}
          onConfirm={handleDeleteConfirm}
          itemType="pet"
          itemName={petToDelete.name}
        />
      )}

      {showRestoreModal && petToRestore && (
        <ConfirmationModal
          config={{
            title: "Restore Pet?",
            message: `Are you sure you want to restore "${petToRestore.name}"? This act will make the pet visible in the store and app immediately.`,
            confirmText: "Yes, Restore",
            type: "confirm",
          }}
          onConfirm={confirmRestore}
          onCancel={() => setShowRestoreModal(false)}
          isLoading={restoreLoading}
        />
      )}
    </div>
  );
};

export default PetManagement;

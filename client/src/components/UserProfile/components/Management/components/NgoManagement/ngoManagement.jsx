import React, { useCallback, useEffect, useState } from "react";
import styles from "./ngoManagement.module.css";
import { API_BASE_URL } from "../../../../../../utils/constants";
import { PROFILE_SEARCH_EVENT } from "../../../../../../utils/profileSearch";
import toast from "react-hot-toast";
import PetFormModal from "../PetManagement/PetFormModal";
import SellPetModal from "../PetManagement/sellPetModal";
import SoldAdoptedInfoModal from "../PetManagement/components/SoldAdoptedInfoModal";
import ConfirmationModal from "../../../../../ConfirmationModal/ConfirmationModal";
import { ManagementCardSkeleton } from "../../../../../Skeletons";
import FilterSidebar from "../../../../../common/FilterSidebar/FilterSidebar";
import NgoHeader from "./components/NgoHeader";
import NgoPetGrid from "./components/NgoPetGrid";
import ManagementEmptyState from "../common/ManagementEmptyState";
import { Dog } from "lucide-react";
import { Pagination } from "../../../../../common";

const NgoManagement = () => {
  const [pets, setPets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    search: "",
    availability: "available",
  });
  const [showFilters, setShowFilters] = useState(false);
  const [showAdd, setShowAdd] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [selectedPet, setSelectedPet] = useState(null);
  const [showSell, setShowSell] = useState(false);
  const [selectedPetForSale, setSelectedPetForSale] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [petToDelete, setPetToDelete] = useState(null);
  const [adoptedInfoPet, setAdoptedInfoPet] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 8;

  const token =
    localStorage.getItem("token") || sessionStorage.getItem("token");
  const loadPets = useCallback(async () => {
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      const res = await fetch(`${API_BASE_URL}/pets/provider/my-pets`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error();
      const data = await res.json();
      setPets(data.pets || []);
    } catch {
      toast.error("Failed to fetch pets");
    }
    setLoading(false);
  }, [token]);

  useEffect(() => {
    loadPets();
  }, [loadPets]);

  useEffect(() => {
    const handleProfileSearch = (event) => {
      const { query = "", targetTab = "" } = event.detail || {};
      if (targetTab && targetTab !== "management") return;

      setFilters((previous) => ({
        ...previous,
        search: String(query || ""),
      }));
    };

    window.addEventListener(PROFILE_SEARCH_EVENT, handleProfileSearch);
    return () =>
      window.removeEventListener(PROFILE_SEARCH_EVENT, handleProfileSearch);
  }, []);

  const handleDeleteClick = (pet) => {
    setPetToDelete(pet);
    setShowDeleteModal(true);
  };

  const handleAddClick = () => {
    if (!token) {
      toast.error("Please login to add pets");
      return;
    }
    setShowAdd(true);
  };

  const handleEditClick = (pet) => {
    if (!token) {
      toast.error("Please login to edit pets");
      return;
    }
    setSelectedPet(pet);
    setShowEdit(true);
  };

  const handleDeleteRequest = (pet) => {
    if (!token) {
      toast.error("Please login to delete pets");
      return;
    }
    handleDeleteClick(pet);
  };

  const handleSellClick = (pet) => {
    setSelectedPetForSale(pet);
    setShowSell(true);
  };

  const handleSellRequest = (pet) => {
    if (!token) {
      toast.error("Please login to continue");
      return;
    }
    handleSellClick(pet);
  };

  const remove = async () => {
    if (!petToDelete || !token) {
      toast.error("Authentication required");
      return;
    }

    try {
      const deletionReason = `Listing removed by NGO provider from management panel (${petToDelete?.name || "pet"}).`;
      const res = await fetch(`${API_BASE_URL}/pets/${petToDelete._id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ deletion_reason: deletionReason }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message || "Failed to delete pet");
      }
      toast.success("Pet deleted successfully");
      loadPets();
    } catch (error) {
      toast.error(error.message || "Failed to delete pet");
    } finally {
      setShowDeleteModal(false);
      setPetToDelete(null);
    }
  };

  const filtered = pets.filter((p) => {
    const q = String(filters.search || "")
      .trim()
      .toLowerCase();
    const searchableFields = [
      p?.name,
      p?.type,
      p?.species,
      p?.breed,
      p?.category,
      p?.gender,
      p?._id,
      p?.soldToUserId?.name,
    ]
      .filter(Boolean)
      .map((value) => String(value).toLowerCase());
    const matchesSearch =
      !q || searchableFields.some((value) => value.includes(q));
    const isAvailable = p.available !== false;
    const matchesAvailability =
      filters.availability === "all" ||
      (filters.availability === "available" && isAvailable) ||
      ((filters.availability === "adopted" ||
        filters.availability === "unavailable") &&
        !isAvailable);
    return matchesSearch && matchesAvailability;
  });

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [filters]);

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paginatedPets = filtered.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE,
  );

  if (loading) return <ManagementCardSkeleton count={6} />;
  const hasActiveFilters =
    filters.search.trim() !== "" || filters.availability !== "available";

  const filterOptions = [
    {
      id: "availability",
      label: "Availability",
      values: [
        { id: "all", label: "All Pets" },
        { id: "available", label: "Available" },
        { id: "adopted", label: "Adopted" },
      ],
    },
  ];

  return (
    <div className={styles.container}>
      <FilterSidebar
        isOpen={showFilters}
        onClose={() => setShowFilters(false)}
        filters={filters}
        setFilters={setFilters}
        options={filterOptions}
        showSearch={false}
        onReset={() => setFilters({ search: "", availability: "available" })}
      />

      <NgoHeader
        hasActiveFilters={hasActiveFilters}
        onOpenFilters={() => setShowFilters(true)}
        onClearFilters={() =>
          setFilters({ search: "", availability: "available" })
        }
        onAdd={handleAddClick}
      />

      {filtered.length === 0 ? (
        <ManagementEmptyState
          title={hasActiveFilters ? "No matches found" : "No Pets for Adoption"}
          description={
            hasActiveFilters
              ? "Try adjusting your filters to find what you are looking for."
              : "You haven't listed any pets for adoption yet. Start by adding a pet to find them a new home."
          }
          onAdd={hasActiveFilters ? null : handleAddClick}
          icon={Dog}
          buttonText="List a Pet"
        />
      ) : (
        <>
          <NgoPetGrid
            pets={paginatedPets}
            onEdit={handleEditClick}
            onDelete={handleDeleteRequest}
            onSell={handleSellRequest}
            onViewAdoptedInfo={(pet) => setAdoptedInfoPet(pet)}
          />
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
            showPageInfo
          />
        </>
      )}

      {showAdd && (
        <PetFormModal onClose={() => setShowAdd(false)} onSaved={loadPets} />
      )}

      {showEdit && selectedPet && (
        <PetFormModal
          pet={selectedPet}
          onClose={() => {
            setShowEdit(false);
            setSelectedPet(null);
          }}
          onSaved={loadPets}
        />
      )}

      {showSell && selectedPetForSale && (
        <SellPetModal
          pet={selectedPetForSale}
          onClose={() => {
            setShowSell(false);
            setSelectedPetForSale(null);
          }}
          onSold={loadPets}
        />
      )}

      {adoptedInfoPet && (
        <SoldAdoptedInfoModal
          pet={adoptedInfoPet}
          onClose={() => setAdoptedInfoPet(null)}
        />
      )}

      {showDeleteModal && (
        <ConfirmationModal
          config={{
            title: "Delete Pet",
            message: `Are you sure you want to delete "${petToDelete?.name}"? This action cannot be undone.`,
            confirmText: "Yes, Delete",
            type: "cancel",
          }}
          onConfirm={remove}
          onCancel={() => {
            setShowDeleteModal(false);
            setPetToDelete(null);
          }}
        />
      )}
    </div>
  );
};

export default NgoManagement;

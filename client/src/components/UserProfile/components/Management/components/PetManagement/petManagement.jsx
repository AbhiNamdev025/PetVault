import React, { useCallback, useEffect, useState } from "react";
import styles from "./petManagement.module.css";
import { API_BASE_URL } from "../../../../../../utils/constants";
import { PROFILE_SEARCH_EVENT } from "../../../../../../utils/profileSearch";
import toast from "react-hot-toast";
import PetFormModal from "./PetFormModal";
import SellPetModal from "./sellPetModal";
import ConfirmationModal from "../../../../../ConfirmationModal/ConfirmationModal";
import { ManagementCardSkeleton } from "../../../../../Skeletons";
import FilterSidebar from "../../../../../common/FilterSidebar/FilterSidebar";
import PetHeader from "./components/PetHeader";
import PetGrid from "./components/PetGrid";
import ManagementEmptyState from "../common/ManagementEmptyState";
import SoldAdoptedInfoModal from "./components/SoldAdoptedInfoModal";
import { Dog } from "lucide-react";
import { Pagination } from "../../../../../common";

const PetManagement = ({ hideTitleBlock = false }) => {
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
  const [soldInfoPet, setSoldInfoPet] = useState(null);
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

  const remove = async (reason) => {
    if (!petToDelete || !token) {
      toast.error("Authentication required");
      return;
    }

    try {
      const res = await fetch(`${API_BASE_URL}/pets/${petToDelete._id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ deletion_reason: reason }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Failed to delete");
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

  const filtered = pets
    .filter((p) => {
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
      const matchesAvailability =
        filters.availability === "all" ||
        (filters.availability === "available" && p.available) ||
        (filters.availability === "sold" && !p.available);
      return matchesSearch && matchesAvailability;
    })
    .sort((a, b) => {
      if (a.available === b.available) return 0;
      return a.available ? -1 : 1;
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

  const savedUser = JSON.parse(localStorage.getItem("user") || "{}");
  const isNgo = savedUser?.role === "ngo";

  const filterOptions = [
    {
      id: "availability",
      label: "Availability",
      values: [
        { id: "all", label: "All Pets" },
        { id: "available", label: "Available" },
        { id: "sold", label: isNgo ? "Adopted" : "Sold" },
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

      <PetHeader
        hasActiveFilters={hasActiveFilters}
        onOpenFilters={() => setShowFilters(true)}
        onClearFilters={() =>
          setFilters({ search: "", availability: "available" })
        }
        onAdd={handleAddClick}
        hideTitleBlock={hideTitleBlock}
      />

      {filtered.length === 0 ? (
        <ManagementEmptyState
          title={
            hasActiveFilters
              ? "No matches found"
              : isNgo
                ? "No Pets for Adoption"
                : "No Pets for Sale"
          }
          description={
            hasActiveFilters
              ? "Try adjusting your filters to find what you are looking for."
              : isNgo
                ? "You haven't listed any pets for adoption yet. Start by adding a pet to help them find a loving home."
                : "You haven't listed any pets for sale yet. Start by adding a pet to reach potential buyers."
          }
          onAdd={hasActiveFilters ? null : handleAddClick}
          icon={Dog}
          buttonText={isNgo ? "Add Pet for Adoption" : "Add Pet"}
        />
      ) : (
        <>
          <PetGrid
            pets={paginatedPets}
            onEdit={handleEditClick}
            onDelete={handleDeleteRequest}
            onSell={handleSellRequest}
            onViewSoldInfo={(pet) => setSoldInfoPet(pet)}
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

      {soldInfoPet && (
        <SoldAdoptedInfoModal
          pet={soldInfoPet}
          onClose={() => setSoldInfoPet(null)}
        />
      )}

      {showDeleteModal && (
        <ConfirmationModal
          config={{
            title: "Delete Pet",
            message: `Are you sure you want to delete "${petToDelete?.name}"? Please provide a reason for deletion.`,
            confirmText: "Yes, Delete",
            type: "cancel",
            showInput: true,
            inputPlaceholder: "Reason for deletion (min 10 chars)...",
            required: true,
            inputValidator: (val) =>
              val.trim().length < 10
                ? "Reason must be at least 10 characters"
                : "",
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

export default PetManagement;

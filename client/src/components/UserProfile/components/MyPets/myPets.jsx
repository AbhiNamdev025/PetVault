import React, { useState, useEffect, useCallback } from "react";
import toast from "react-hot-toast";
import { ArrowLeft } from "lucide-react";
import styles from "./myPets.module.css";
import { PetCardSkeleton } from "../../../Skeletons";
import { API_BASE_URL } from "../../../../utils/constants";
import { PROFILE_SEARCH_EVENT } from "../../../../utils/profileSearch";
import ConfirmationModal from "../../../ConfirmationModal/ConfirmationModal";
import PetFormModal from "./components/PetFormModal/PetFormModal";
import PetHeader from "./components/PetHeader/PetHeader";
import PetEmptyState from "./components/PetEmptyState/PetEmptyState";
import PetGrid from "./components/PetGrid/PetGrid";
import FilterSidebar from "../../../common/FilterSidebar/FilterSidebar";
import { PetProfileContent } from "./PetProfile/PetProfile";
import { Button } from "../../../common";
const MyPets = ({
  initialSelectedPetId = null,
  initialSelectedPetTab = null,
  onInitialSelectionApplied,
  setIsDetailsView,
}) => {
  const [pets, setPets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingPet, setEditingPet] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [petToDelete, setPetToDelete] = useState(null);
  const [selectedPetId, setSelectedPetId] = useState(null);
  const [selectedPetTab, setSelectedPetTab] = useState("overview");
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    search: "",
    status: "active",
  });

  const defaultFormState = {
    name: "",
    species: "",
    breed: "",
    gender: "Male",
    dob: "",
    age: "",
    weight: "",
    colorMarks: "",
    image: null,
    medicalConditions: [],
    allergies: [],
  };
  const [initialData, setInitialData] = useState(defaultFormState);

  const fetchPets = useCallback(async () => {
    try {
      setLoading(true);
      const token =
        localStorage.getItem("token") || sessionStorage.getItem("token");
      const url =
        filters.status === "archived"
          ? `${API_BASE_URL}/user-pets?includeArchived=true`
          : `${API_BASE_URL}/user-pets`;
      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        const filteredData =
          filters.status === "archived"
            ? data.filter((p) => p.status === "archived")
            : data;
        setPets(filteredData);
      } else {
        throw new Error("Failed to fetch pets");
      }
    } catch (error) {
      console.error("Error fetching pets:", error);
      toast.error("Failed to load pets");
    } finally {
      setLoading(false);
    }
  }, [filters.status]);

  useEffect(() => {
    fetchPets();
  }, [fetchPets]);

  useEffect(() => {
    const handleProfileSearch = (event) => {
      const { query = "", targetTab = "" } = event.detail || {};
      if (targetTab && targetTab !== "mypets") return;

      setFilters((previous) => ({
        ...previous,
        search: String(query || ""),
      }));
    };

    window.addEventListener(PROFILE_SEARCH_EVENT, handleProfileSearch);
    return () =>
      window.removeEventListener(PROFILE_SEARCH_EVENT, handleProfileSearch);
  }, []);

  useEffect(() => {
    if (!initialSelectedPetId) return;
    setSelectedPetId(initialSelectedPetId);
    setSelectedPetTab(initialSelectedPetTab || "overview");
    if (typeof onInitialSelectionApplied === "function") {
      onInitialSelectionApplied();
    }
  }, [initialSelectedPetId, initialSelectedPetTab, onInitialSelectionApplied]);
  useEffect(() => {
    if (showModal) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [showModal]);

  useEffect(() => {
    if (setIsDetailsView) {
      setIsDetailsView(!!selectedPetId);
    }
  }, [selectedPetId, setIsDetailsView]);

  const handleFormSubmit = async (formData) => {
    const token =
      localStorage.getItem("token") || sessionStorage.getItem("token");
    const data = new FormData();
    const useDob = Boolean(formData.dob);
    const useAge = !useDob && Boolean(formData.age);
    Object.keys(formData).forEach((key) => {
      if (useDob && key === "age") return;
      if (useAge && key === "dob") return;
      if (key === "medicalConditions" || key === "allergies") {
        data.append(key, JSON.stringify(formData[key]));
      } else if (key === "image" && formData[key]) {
        data.append("profileImage", formData[key]);
      } else if (key !== "image") {
        data.append(key, formData[key]);
      }
    });
    try {
      let response;
      if (editingPet) {
        response = await fetch(`${API_BASE_URL}/user-pets/${editingPet._id}`, {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: data,
        });
      } else {
        response = await fetch(`${API_BASE_URL}/user-pets`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: data,
        });
      }
      if (!response.ok) throw new Error("Failed to save pet");
      toast.success(
        editingPet ? "Pet updated successfully" : "Pet added successfully",
      );
      closeModal();
      fetchPets();
    } catch (error) {
      console.error("Error saving pet:", error);
      toast.error("Failed to save pet details");
    }
  };
  const confirmDelete = async () => {
    if (!petToDelete) return;
    try {
      const token =
        localStorage.getItem("token") || sessionStorage.getItem("token");
      const response = await fetch(
        `${API_BASE_URL}/user-pets/${petToDelete._id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );
      if (!response.ok) throw new Error("Failed to delete");
      toast.success("Pet removed successfully");
      fetchPets();
    } catch (error) {
      console.error("Error deleting pet:", error);
      toast.error("Failed to remove pet");
    } finally {
      setShowDeleteModal(false);
      setPetToDelete(null);
    }
  };

  const handleRestore = async (pet) => {
    try {
      const token =
        localStorage.getItem("token") || sessionStorage.getItem("token");
      const response = await fetch(
        `${API_BASE_URL}/user-pets/${pet._id}/restore`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );
      if (!response.ok) throw new Error("Failed to restore");
      toast.success("Pet restored successfully");
      fetchPets();
    } catch (error) {
      console.error("Error restoring pet:", error);
      toast.error("Failed to restore pet");
    }
  };

  const handleDeleteClick = (pet) => {
    setPetToDelete(pet);
    setShowDeleteModal(true);
  };
  const openAddModal = () => {
    setEditingPet(null);
    setInitialData(defaultFormState);
    setShowModal(true);
  };
  const openEditModal = (pet) => {
    setEditingPet(pet);
    setInitialData({
      name: pet.name,
      species: pet.species,
      breed: pet.breed,
      dob: pet.dob ? new Date(pet.dob).toISOString().split("T")[0] : "",
      age: pet.age || "",
      gender: pet.gender,
      weight: pet.weight,
      colorMarks: pet.colorMarks || "",
      image: null,
      medicalConditions: pet.medicalConditions || [],
      allergies: pet.allergies || [],
    });
    setShowModal(true);
  };
  const closeModal = () => {
    setShowModal(false);
    setEditingPet(null);
  };
  const resetFilters = () => {
    setFilters({
      search: "",
      status: "active",
    });
  };
  const visiblePets = pets.filter((pet) => {
    const query = String(filters.search || "")
      .trim()
      .toLowerCase();
    if (!query) return true;
    const searchableText = [
      pet.name,
      pet.species,
      pet.breed,
      pet.gender,
      pet.petId,
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();
    return searchableText.includes(query);
  });
  const hasActiveFilters =
    String(filters.search || "").trim() !== "" || filters.status !== "active";
  const filterOptions = [
    {
      id: "status",
      label: "Status",
      clearValue: "active",
      values: [
        { id: "active", label: "Active Pets" },
        { id: "archived", label: "Archived Pets" },
      ],
    },
  ];

  if (loading) return <PetCardSkeleton count={4} />;
  return (
    <div className={styles.container}>
      {selectedPetId ? (
        <div className={styles.detailsView}>
          <Button
            className={styles.backBtn}
            onClick={() => {
              setSelectedPetId(null);
              setSelectedPetTab("overview");
            }}
            variant="ghost"
            size="sm"
          >
            <ArrowLeft size={18} /> Back to My Pets
          </Button>
          <div className={styles.detailsCard}>
            <PetProfileContent
              petId={selectedPetId}
              isMinimal={false}
              initialTab={selectedPetTab}
            />
          </div>
        </div>
      ) : (
        <>
          <FilterSidebar
            isOpen={showFilters}
            onClose={() => setShowFilters(false)}
            filters={filters}
            setFilters={setFilters}
            options={filterOptions}
            showSearch={false}
            onReset={resetFilters}
          />

          <PetHeader
            onAdd={openAddModal}
            hasActiveFilters={hasActiveFilters}
            onOpenFilters={() => setShowFilters(true)}
            onClearFilters={resetFilters}
          />

          {pets.length === 0 ? (
            filters.status === "active" ? (
              <PetEmptyState onAdd={openAddModal} />
            ) : (
              <div className={styles.noResults}>No archived pets found.</div>
            )
          ) : visiblePets.length === 0 ? (
            <div className={styles.noResults}>No pets match your search.</div>
          ) : (
            <PetGrid
              pets={visiblePets}
              onEdit={openEditModal}
              onDelete={handleDeleteClick}
              onRestore={handleRestore}
              onView={(pet) => {
                setSelectedPetId(pet._id);
                setSelectedPetTab("overview");
              }}
            />
          )}
        </>
      )}

      {showModal && (
        <PetFormModal
          isOpen={showModal}
          onClose={closeModal}
          onSubmit={handleFormSubmit}
          editingPet={editingPet}
          initialData={initialData}
        />
      )}

      {showDeleteModal && (
        <ConfirmationModal
          config={{
            title: "Delete Pet",
            message: `Are you sure you want to archive ${petToDelete?.name}? You can restore later.`,
            confirmText: "Yes, Archive",
            type: "cancel",
          }}
          onConfirm={confirmDelete}
          onCancel={() => {
            setShowDeleteModal(false);
            setPetToDelete(null);
          }}
        />
      )}
    </div>
  );
};
export default MyPets;

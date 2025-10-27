import React, { useState, useEffect } from "react";
import { Plus, Search, Filter, Edit, Trash2, Eye } from "lucide-react";
import { toast } from "react-toastify";
import AddPetModal from "./AddPetModal/addPetModal";
import EditPetModal from "./EditPetModal/editPetModal";
import DeleteConfirmationModal from "../DeleteConfirmationModal/deleteConfirmationModal";
import styles from "./petManagement.module.css";
import { API_BASE_URL } from "../../../utils/constants";

const PetManagement = () => {
  const [pets, setPets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedPet, setSelectedPet] = useState(null);
  const [petToDelete, setPetToDelete] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [filterCategory, setFilterCategory] = useState("all");

  useEffect(() => {
    fetchPets();
  }, []);

  const fetchPets = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_BASE_URL}/pets`, {
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

  const handleAddPet = async (petData) => {
    try {
      const token = localStorage.getItem("token");
      const formData = new FormData();

      Object.keys(petData).forEach((key) => {
        if (key === "images" && petData.images) {
          petData.images.forEach((image) => {
            formData.append("petImages", image);
          });
        } else {
          formData.append(key, petData[key]);
        }
      });

      const response = await fetch(`${API_BASE_URL}/pets/create`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const responseData = await response.json();

      if (response.ok) {
        toast.success("Pet added successfully");
        setShowAddModal(false);
        fetchPets();
      } else {
        toast.error(responseData.message || "Failed to add pet");
      }
    } catch (error) {
      console.error("Add pet error:", error);
      toast.error("Failed to add pet");
    }
  };
 
  const handleEditPet = async (petId, petData) => {
    try {
      const token = localStorage.getItem("token");

      const hasNewImages = petData.images && petData.images.length > 0;

      if (hasNewImages) {
        const formData = new FormData();

        Object.keys(petData).forEach((key) => {
          if (key === "images") {
            petData.images.forEach((image) => {
              formData.append("petImages", image);
            });
          } else {
            formData.append(key, petData[key]);
          }
        });

        const response = await fetch(`${API_BASE_URL}/pets/${petId}`, {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        });

        const responseData = await response.json();

        if (response.ok) {
          toast.success("Pet updated successfully");
          setShowEditModal(false);
          fetchPets();
        } else {
          toast.error(responseData.message || "Failed to update pet");
        }
      } else {
        const response = await fetch(`${API_BASE_URL}/pets/${petId}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(petData),
        });

        const responseData = await response.json();

        if (response.ok) {
          toast.success("Pet updated successfully");
          setShowEditModal(false);
          fetchPets();
        } else {
          toast.error(responseData.message || "Failed to update pet");
        }
      }
    } catch (error) {
      console.error("Update pet error:", error);
      toast.error("Failed to update pet");
    }
  };
  const handleDeleteClick = (pet) => {
    setPetToDelete(pet);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    if (!petToDelete) return;

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_BASE_URL}/pets/${petToDelete._id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        toast.success("Pet deleted successfully");
        setShowDeleteModal(false);
        setPetToDelete(null);
        fetchPets();
      } else {
        toast.error("Failed to delete pet");
      }
    } catch (error) {
      toast.error("Failed to delete pet");
    }
  };

  const handleDeleteCancel = () => {
    setShowDeleteModal(false);
    setPetToDelete(null);
  };

  const filteredPets = pets.filter((pet) => {
    const matchesSearch =
      pet.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      pet.breed.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === "all" || pet.type === filterType;
    const matchesCategory =
      filterCategory === "all" || pet.category === filterCategory;
    return matchesSearch && matchesType && matchesCategory;
  });

  if (loading) {
    return <div className={styles.loading}>Loading pets...</div>;
  }

  return (
    <div className={styles.petManagement}>
      <div className={styles.header}>
        <div>
          <h1>Pets Management</h1>
          <p>Manage all pets available for adoption and sale</p>
        </div>
        <button
          className={styles.addButton}
          onClick={() => setShowAddModal(true)}
        >
          <Plus size={20} />
          Add New Pet
        </button>
      </div>

      <div className={styles.controls}>
        <div className={styles.searchBox}>
          <Search size={20} />
          <input
            type="text"
            placeholder="Search pets by name or breed..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className={styles.filterBox}>
          <Filter size={20} />
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
          >
            <option value="all">All Types</option>
            <option value="dog">Dogs</option>
            <option value="cat">Cats</option>
            <option value="bird">Birds</option>
            <option value="rabbit">Rabbits</option>
            <option value="other">Other</option>
          </select>
        </div>
        <div className={styles.filterBox}>
          <Filter size={20} />
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
          >
            <option value="all">All Categories</option>
            <option value="shop">For Sale</option>
            <option value="adoption">For Adoption</option>
          </select>
        </div>
      </div>

      <div className={styles.petsGrid}>
        {filteredPets.length === 0 ? (
          <div className={styles.emptyState}>
            <p>No pets found</p>
            <button
              className={styles.addButton}
              onClick={() => setShowAddModal(true)}
            >
              <Plus size={20} />
              Add Your First Pet
            </button>
          </div>
        ) : (
          filteredPets.map((pet) => (
            <div key={pet._id} className={styles.petCard}>
              <div className={styles.petImage}>
                {pet.images && pet.images.length > 0 ? (
                  <img
                    src={`http://localhost:5000/uploads/pets/${pet.images?.[0]}`}
                    alt={pet.name}
                  />
                ) : (
                  <div className={styles.noImage}>No Image</div>
                )}
                <div className={styles.petStatus}>
                  <span
                    className={`${styles.status} ${
                      pet.available ? styles.available : styles.sold
                    }`}
                  >
                    {pet.available
                      ? "Available"
                      : pet.category === "shop"
                      ? "Sold"
                      : "Adopted"}
                  </span>
                  <span
                    className={`${styles.categoryBadge} ${
                      pet.category === "shop" ? styles.shop : styles.adoption
                    }`}
                  >
                    {pet.category === "shop" ? "For Sale" : "For Adoption"}
                  </span>
                </div>
              </div>

              <div className={styles.petInfo}>
                <h3>{pet.name}</h3>
                <p className={styles.breed}>{pet.breed}</p>
                <div className={styles.details}>
                  <span className={styles.type}>{pet.type}</span>
                  <span className={styles.gender}>{pet.gender}</span>
                  <span className={styles.age}>
                    {pet.age} {pet.ageUnit}
                  </span>
                </div>
                {pet.category === "shop" && (
                  <div className={styles.price}>Rs.{pet.price}</div>
                )}
                {pet.category === "adoption" && (
                  <div className={styles.adoptionText}>Free Adoption</div>
                )}

                <div className={styles.actions}>
                  <button
                    className={styles.viewBtn}
                    onClick={() => window.open(`/pets/${pet._id}`, "_blank")}
                  >
                    <Eye size={16} />
                    View
                  </button>
                  <button
                    className={styles.editBtn}
                    onClick={() => {
                      setSelectedPet(pet);
                      setShowEditModal(true);
                    }}
                  >
                    <Edit size={16} />
                    Edit
                  </button>
                  <button
                    className={styles.deleteBtn}
                    onClick={() => handleDeleteClick(pet)}
                  >
                    <Trash2 size={16} />
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {showAddModal && (
        <AddPetModal
          onClose={() => setShowAddModal(false)}
          onSave={handleAddPet}
        />
      )}

      {showEditModal && selectedPet && (
        <EditPetModal
          pet={selectedPet}
          onClose={() => {
            setShowEditModal(false);
            setSelectedPet(null);
          }}
          onSave={handleEditPet}
        />
      )}

      {showDeleteModal && petToDelete && (
        <DeleteConfirmationModal
          isOpen={showDeleteModal}
          onClose={handleDeleteCancel}
          onConfirm={handleDeleteConfirm}
          itemType="pet"
          itemName={petToDelete.name}
        />
      )}
    </div>
  );
};

export default PetManagement;

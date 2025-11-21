import React, { useEffect, useState } from "react";
import styles from "./petManagement.module.css";
import { API_BASE_URL } from "../../../../../../utils/constants";
import { Plus, Search, Edit, Trash2 } from "lucide-react";
import { toast } from "react-toastify";
import AddPetModal from "./addPetModal";
import EditPetModal from "./editPetModal";
import ConfirmationModal from "../../../../../ConfirmationModal/ConfirmationModal";

const PetManagement = ({ user }) => {
  const [pets, setPets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showAdd, setShowAdd] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [selectedPet, setSelectedPet] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [petToDelete, setPetToDelete] = useState(null);

  const token = localStorage.getItem("token") || sessionStorage.getItem("token");
  const savedUser = JSON.parse(localStorage.getItem("user") || sessionStorage.getItem("user") || "null");
  const shopId = savedUser?._id || user?._id;

  const loadPets = async () => {
    if (!token || !shopId) {
      toast.error("Authentication required");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch(`${API_BASE_URL}/pets/shop/${shopId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (!res.ok) throw new Error();
      const data = await res.json();
      setPets(data.pets || []);
    } catch {
      toast.error("Failed to fetch pets");
    }
    setLoading(false);
  };

  useEffect(() => {
    loadPets();
  }, []);

  const handleDeleteClick = (pet) => {
    setPetToDelete(pet);
    setShowDeleteModal(true);
  };

  const remove = async () => {
    if (!petToDelete || !token) {
      toast.error("Authentication required");
      return;
    }

    try {
      const res = await fetch(`${API_BASE_URL}/pets/${petToDelete._id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });

      if (!res.ok) throw new Error();
      toast.success("Pet deleted successfully");
      loadPets();
    } catch {
      toast.error("Failed to delete pet");
    } finally {
      setShowDeleteModal(false);
      setPetToDelete(null);
    }
  };

  const filtered = pets.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <p className={styles.loading}>Loading...</p>;

  return (
    <div className={styles.container}>
      <div className={styles.topRow}>
        <h2 className={styles.title}>Manage Pets</h2>
        <button 
          className={styles.addBtn} 
          onClick={() => {
            if (!token) {
              toast.error("Please login to add pets");
              return;
            }
            setShowAdd(true);
          }}
        >
          <Plus size={16} /> Add Pet
        </button>
      </div>

      <div className={styles.searchBox}>
        <Search size={18} />
        <input
          type="text"
          placeholder="Search pet..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {filtered.length === 0 ? (
        <p className={styles.noData}>No pets found</p>
      ) : (
        <div className={styles.grid}>
          {filtered.map((p) => (
            <div className={styles.card} key={p._id}>
              <div className={styles.imageBox}>
                {p.images?.[0] ? (
                  <img
                    src={`${API_BASE_URL.replace(
                      "/api",
                      ""
                    )}/uploads/pets/${p.images[0]}`}
                    alt=""
                  />
                ) : (
                  <div className={styles.noImage}>No Image</div>
                )}
              </div>

              <div className={styles.info}>
                <h3 className={styles.name}>{p.name}</h3>
                <p className={styles.brand}>{p.type}</p>
                <p className={styles.price}>₹{p.price}</p>
              </div>

              <div className={styles.actions}>
                <button
                  className={styles.editBtn}
                  onClick={() => {
                    if (!token) {
                      toast.error("Please login to edit pets");
                      return;
                    }
                    setSelectedPet(p);
                    setShowEdit(true);
                  }}
                >
                  <Edit size={16} />
                </button>

                <button 
                  className={styles.delBtn} 
                  onClick={() => {
                    if (!token) {
                      toast.error("Please login to delete pets");
                      return;
                    }
                    handleDeleteClick(p);
                  }}
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showAdd && (
        <AddPetModal 
          onClose={() => setShowAdd(false)} 
          onAdded={loadPets} 
        />
      )}

      {showEdit && selectedPet && (
        <EditPetModal
          pet={selectedPet}
          onClose={() => {
            setShowEdit(false);
            setSelectedPet(null);
          }}
          onUpdated={loadPets}
        />
      )}

      {showDeleteModal && (
        <ConfirmationModal
          config={{
            title: "Delete Pet",
            message: `Are you sure you want to delete "${petToDelete?.name}"? This action cannot be undone.`,
            confirmText: "Yes, Delete",
            type: "cancel"
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
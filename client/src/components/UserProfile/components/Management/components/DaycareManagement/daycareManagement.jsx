import React, { useEffect, useState } from "react";
import styles from "./daycareManagement.module.css";
import { API_BASE_URL } from "../../../../../../utils/constants";
import { PROFILE_SEARCH_EVENT } from "../../../../../../utils/profileSearch";
import CaretakerFormModal from "./CaretakerFormModal";
import toast from "react-hot-toast";
import ConfirmationModal from "../../../../../ConfirmationModal/ConfirmationModal";
import DaycareHeader from "./components/DaycareHeader";
import CaretakerGrid from "./components/CaretakerGrid";
import ManagementEmptyState from "../common/ManagementEmptyState";
import { Users as UsersIcon } from "lucide-react";
import { Pagination } from "../../../../../common";

const DaycareManagement = ({ user }) => {
  const token =
    localStorage.getItem("token") || sessionStorage.getItem("token");
  const daycareId = user?._id;

  const [caretakers, setCaretakers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [selectedCaretaker, setSelectedCaretaker] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [caretakerToDelete, setCaretakerToDelete] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 8;

  const loadCaretakers = async () => {
    if (!daycareId) return;
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE_URL}/daycare/staff/${daycareId}`);
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();
      setCaretakers(data.caretakers || []);
      setCurrentPage(1); // Reset to first page on new data load
    } catch (error) {
      console.error("Error loading caretakers:", error);
      toast.error("Failed to load staff");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCaretakers();
  }, [daycareId]);

  useEffect(() => {
    const handleProfileSearch = (event) => {
      const { query = "", targetTab = "" } = event.detail || {};
      if (targetTab && targetTab !== "management") return;
      setSearchQuery(String(query || ""));
    };

    window.addEventListener(PROFILE_SEARCH_EVENT, handleProfileSearch);
    return () =>
      window.removeEventListener(PROFILE_SEARCH_EVENT, handleProfileSearch);
  }, []);

  const confirmDelete = async () => {
    if (!caretakerToDelete) return;

    const res = await fetch(`${API_BASE_URL}/caretaker/${caretakerToDelete}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });

    if (res.ok) {
      toast.success("Caretaker removed");
      loadCaretakers();
    } else toast.error("Failed");

    setShowDeleteModal(false);
    setCaretakerToDelete(null);
  };

  const normalizedSearch = String(searchQuery || "")
    .trim()
    .toLowerCase();
  const filteredCaretakers = caretakers.filter((caretaker) => {
    if (!normalizedSearch) return true;
    const searchable = [
      caretaker?.name,
      caretaker?.email,
      caretaker?.phone,
      caretaker?.roleData?.staffSpecialization,
      caretaker?._id,
    ]
      .filter(Boolean)
      .map((value) => String(value).toLowerCase());
    return searchable.some((value) => value.includes(normalizedSearch));
  });

  useEffect(() => {
    setCurrentPage(1);
  }, [normalizedSearch, caretakers.length]);

  const totalPages = Math.ceil(filteredCaretakers.length / ITEMS_PER_PAGE);
  const paginatedCaretakers = filteredCaretakers.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE,
  );

  const deleteCaretaker = (id) => {
    setCaretakerToDelete(id);
    setShowDeleteModal(true);
  };

  if (loading) return <div className={styles.loading}>Loading staff...</div>;

  return (
    <div className={styles.container}>
      <DaycareHeader onAdd={() => setShowAdd(true)} />

      {filteredCaretakers.length === 0 ? (
        <ManagementEmptyState
          title={normalizedSearch ? "No matching caretakers found" : "No Staff Members"}
          description={
            normalizedSearch
              ? "Try a different search term."
              : "Manage your daycare staff here. Start by adding your first caretaker to help handle pet bookings."
          }
          onAdd={() => setShowAdd(true)}
          icon={UsersIcon}
          buttonText="Add Caretaker"
        />
      ) : (
        <>
          <CaretakerGrid
            caretakers={paginatedCaretakers}
            onEdit={(caretaker) => {
              setSelectedCaretaker(caretaker);
              setShowEdit(true);
            }}
            onDelete={deleteCaretaker}
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
        <CaretakerFormModal
          daycareId={daycareId}
          onClose={() => setShowAdd(false)}
          onSaved={loadCaretakers}
        />
      )}

      {showEdit && selectedCaretaker && (
        <CaretakerFormModal
          caretaker={selectedCaretaker}
          onClose={() => setShowEdit(false)}
          onSaved={loadCaretakers}
        />
      )}

      {showDeleteModal && (
        <ConfirmationModal
          config={{
            title: "Remove Caretaker",
            message:
              "Are you sure you want to remove this caretaker? This action cannot be undone.",
            confirmText: "Yes, Remove",
            type: "cancel",
          }}
          onConfirm={confirmDelete}
          onCancel={() => {
            setShowDeleteModal(false);
            setCaretakerToDelete(null);
          }}
        />
      )}
    </div>
  );
};

export default DaycareManagement;

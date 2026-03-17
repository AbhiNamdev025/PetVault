import React, { useEffect, useState } from "react";
import styles from "./hospitalManagement.module.css";
import { API_BASE_URL } from "../../../../../../utils/constants";
import { PROFILE_SEARCH_EVENT } from "../../../../../../utils/profileSearch";
import DoctorFormModal from "./DoctorFormModal";
import toast from "react-hot-toast";
import ConfirmationModal from "../../../../../ConfirmationModal/ConfirmationModal";
import HospitalHeader from "./components/HospitalHeader";
import DoctorGrid from "./components/DoctorGrid";
import ManagementEmptyState from "../common/ManagementEmptyState";
import { Stethoscope as StethoscopeIcon } from "lucide-react";
import { Pagination } from "../../../../../common";

const HospitalManagement = ({ user }) => {
  const token =
    localStorage.getItem("token") || sessionStorage.getItem("token");
  const hospitalId = user?._id;

  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [doctorToDelete, setDoctorToDelete] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 8;

  const loadDoctors = async () => {
    if (!hospitalId) return;
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE_URL}/hospital/doctors/${hospitalId}`);
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();
      setDoctors(data.doctors || []);
    } catch (error) {
      console.error("Error loading doctors:", error);
      toast.error("Failed to load doctors");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDoctors();
  }, [hospitalId]);

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
    if (!doctorToDelete) return;

    const res = await fetch(`${API_BASE_URL}/doctor/${doctorToDelete}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });

    if (res.ok) {
      toast.success("Doctor Removed");
      loadDoctors();
    } else toast.error("Failed");

    setShowDeleteModal(false);
    setDoctorToDelete(null);
  };

  const normalizedSearch = String(searchQuery || "")
    .trim()
    .toLowerCase();
  const filteredDoctors = doctors.filter((doctor) => {
    if (!normalizedSearch) return true;
    const searchable = [
      doctor?.roleData?.doctorName,
      doctor?.name,
      doctor?.email,
      doctor?.phone,
      doctor?.roleData?.doctorSpecialization,
      doctor?._id,
    ]
      .filter(Boolean)
      .map((value) => String(value).toLowerCase());
    return searchable.some((value) => value.includes(normalizedSearch));
  });

  useEffect(() => {
    setCurrentPage(1);
  }, [normalizedSearch, doctors.length]);

  const totalPages = Math.ceil(filteredDoctors.length / ITEMS_PER_PAGE);
  const paginatedDoctors = filteredDoctors.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE,
  );

  const deleteDoctor = (doctorId) => {
    setDoctorToDelete(doctorId);
    setShowDeleteModal(true);
  };

  if (loading) return <div className={styles.loading}>Loading doctors...</div>;

  return (
    <div className={styles.container}>
      <HospitalHeader onAdd={() => setShowAdd(true)} />

      {filteredDoctors.length === 0 ? (
        <ManagementEmptyState
          title={normalizedSearch ? "No matching doctors found" : "No Doctors Registered"}
          description={
            normalizedSearch
              ? "Try a different search term."
              : "You haven't added any doctors to your hospital yet. Add your first doctor to start managing appointments."
          }
          onAdd={() => setShowAdd(true)}
          icon={StethoscopeIcon}
          buttonText="Add Doctor"
        />
      ) : (
        <>
          <DoctorGrid
            doctors={paginatedDoctors}
            onEdit={(doctor) => {
              setSelectedDoctor(doctor);
              setShowEdit(true);
            }}
            onDelete={deleteDoctor}
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
        <DoctorFormModal
          hospitalId={hospitalId}
          onClose={() => setShowAdd(false)}
          onSaved={loadDoctors}
        />
      )}

      {showEdit && selectedDoctor && (
        <DoctorFormModal
          doctor={selectedDoctor}
          onClose={() => setShowEdit(false)}
          onSaved={loadDoctors}
        />
      )}

      {showDeleteModal && (
        <ConfirmationModal
          config={{
            title: "Remove Doctor",
            message:
              "Are you sure you want to remove this doctor? This action cannot be undone.",
            confirmText: "Yes, Remove",
            type: "cancel",
          }}
          onConfirm={confirmDelete}
          onCancel={() => {
            setShowDeleteModal(false);
            setDoctorToDelete(null);
          }}
        />
      )}
    </div>
  );
};

export default HospitalManagement;

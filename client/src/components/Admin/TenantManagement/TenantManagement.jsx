import React, { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./tenantManagement.module.css";
import { API_BASE_URL } from "../../../utils/constants";
import toast from "react-hot-toast";
import TenantFilters from "./Components/TenantFilters/TenantFilters";
import TenantHeader from "./Components/TenantHeader/TenantHeader";
import TenantList from "./Components/TenantList/TenantList";
import TenantPagination from "./Components/TenantPagination/TenantPagination";
import TenantModals from "./Components/TenantModals/TenantModals";

function TenantManagement() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [activeMenuId, setActiveMenuId] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  const navigate = useNavigate();

  // Unified Filter State
  const [filters, setFilters] = useState(() => {
    const saved = sessionStorage.getItem("admin_tenant_filters");
    return saved
      ? JSON.parse(saved)
      : {
          category: "all",
          status: "all",
        };
  });

  // Pagination
  const [currentPage, setCurrentPage] = useState(() => {
    const saved = sessionStorage.getItem("admin_tenant_page");
    return saved ? Number(saved) : 1;
  });

  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Action state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [userToApprove, setUserToApprove] = useState(null);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [userToReject, setUserToReject] = useState(null);
  const [showArchiveModal, setShowArchiveModal] = useState(false);
  const [userToArchive, setUserToArchive] = useState(null);

  useEffect(() => {
    fetchUsers();
    const handleClickOutside = () => setActiveMenuId(null);
    window.addEventListener("click", handleClickOutside);
    return () => window.removeEventListener("click", handleClickOutside);
  }, []);

  useEffect(() => {
    sessionStorage.setItem("admin_tenant_filters", JSON.stringify(filters));
  }, [filters]);

  useEffect(() => {
    sessionStorage.setItem("admin_tenant_page", currentPage);
  }, [currentPage]);

  const updateFilters = (newFilters) => {
    setFilters(newFilters);
    setCurrentPage(1);
  };

  const filteredUsers = useMemo(() => {
    let result = users;
    const allRoles = [
      "shop",
      "hospital",
      "daycare",
      "ngo",
      "doctor",
      "caretaker",
      "user",
      "admin",
    ];
    result = result.filter((u) => allRoles.includes(u.role));

    if (filters.category !== "all" && filters.category !== "providers") {
      result = result.filter((u) => u.role === filters.category);
    } else if (filters.category === "providers") {
      result = result.filter((u) => u.role !== "user" && u.role !== "admin");
    }

    if (filters.status !== "all") {
      if (filters.status === "archived") {
        result = result.filter((u) => u.isArchived);
      } else {
        result = result.filter(
          (u) => u.kycStatus === filters.status && !u.isArchived,
        );
      }
    }

    return result;
  }, [filters, users]);

  // Pagination Logic
  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
  const paginatedUsers = filteredUsers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  const fetchUsers = async () => {
    try {
      const token =
        localStorage.getItem("token") || sessionStorage.getItem("token");
      const res = await fetch(`${API_BASE_URL}/admin/users`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) setUsers(data);
      else toast.error(data.message || "Failed to fetch users");
    } catch {
      toast.error("Error fetching users");
    } finally {
      setLoading(false);
    }
  };

  const handleRowClick = (user) => navigate(`/admin/tenants/${user._id}`);

  const handleConfirmApprove = async () => {
    if (!userToApprove) return;
    setIsSubmitting(true);
    try {
      const token =
        localStorage.getItem("token") || sessionStorage.getItem("token");
      const res = await fetch(
        `${API_BASE_URL}/admin/users/${userToApprove._id}/approve`,
        {
          method: "PUT",
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      if (res.ok) {
        toast.success("Provider approved successfully");
        updateUserLocally(userToApprove._id, {
          kycStatus: "approved",
          isVerified: true,
        });
      } else {
        const data = await res.json();
        toast.error(data.message || "Failed to approve");
      }
    } catch {
      toast.error("Error approving provider");
    } finally {
      setIsSubmitting(false);
      setShowApproveModal(false);
      setUserToApprove(null);
    }
  };

  const handleConfirmReject = async (remark) => {
    if (!userToReject) return;
    setIsSubmitting(true);
    try {
      const token =
        localStorage.getItem("token") || sessionStorage.getItem("token");
      const res = await fetch(
        `${API_BASE_URL}/admin/users/${userToReject._id}/reject`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ remark }),
        },
      );
      if (res.ok) {
        toast.success("Provider rejected");
        updateUserLocally(userToReject._id, {
          kycStatus: "rejected",
          isVerified: false,
        });
      } else {
        const data = await res.json();
        toast.error(data.message || "Failed to reject");
      }
    } catch {
      toast.error("Error rejecting provider");
    } finally {
      setIsSubmitting(false);
      setShowRejectModal(false);
      setUserToReject(null);
    }
  };

  const confirmArchiveUser = async () => {
    if (!userToArchive) return;
    setIsSubmitting(true);
    try {
      const token =
        localStorage.getItem("token") || sessionStorage.getItem("token");
      const res = await fetch(
        `${API_BASE_URL}/admin/users/${userToArchive._id}/archive`,
        {
          method: "PUT",
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      if (res.ok) {
        toast.success(
          userToArchive.isArchived ? "User unarchived" : "User archived",
        );
        updateUserLocally(userToArchive._id, {
          isArchived: !userToArchive.isArchived,
        });
      } else {
        toast.error("Failed to update archive status");
      }
    } catch {
      toast.error("Error updating archive status");
    } finally {
      setIsSubmitting(false);
      setShowArchiveModal(false);
      setUserToArchive(null);
    }
  };

  const updateUserLocally = (userId, updates) => {
    setUsers((prev) =>
      prev.map((u) => (u._id === userId ? { ...u, ...updates } : u)),
    );
    if (selectedUser?._id === userId)
      setSelectedUser((prev) => ({ ...prev, ...updates }));
  };

  const hasActiveFilters =
    filters.category !== "all" || filters.status !== "all";

  const filterOptions = [
    {
      id: "category",
      label: "Role",
      values: [
        { id: "all", label: "All Users" },
        { id: "providers", label: "Tenants" },
        { id: "user", label: "Pet Owners" },
        { id: "shop", label: "Shop Owners" },
        { id: "doctor", label: "Veterinarians" },
        { id: "hospital", label: "Hospitals" },
        { id: "daycare", label: "Daycares" },
        { id: "caretaker", label: "Caretakers" },
        { id: "ngo", label: "NGOs" },
      ],
    },
    {
      id: "status",
      label: "Status",
      values: [
        { id: "all", label: "All Statuses" },
        { id: "approved", label: "Active Only" },
        { id: "pending", label: "Pending" },
        { id: "rejected", label: "Suspended" },
        { id: "archived", label: "Archived" },
      ],
    },
  ];

  return (
    <div className={styles.pageContainer}>
      <TenantFilters
        isOpen={showFilters}
        onClose={() => setShowFilters(false)}
        filters={filters}
        setFilters={updateFilters}
        options={filterOptions}
        onReset={() => updateFilters({ category: "all", status: "all" })}
      />

      <TenantHeader
        onFilterToggle={() => setShowFilters(true)}
        hasActiveFilters={hasActiveFilters}
      />

      <main className={styles.mainContent}>
        <TenantList
          users={paginatedUsers}
          loading={loading}
          onRowClick={handleRowClick}
          activeMenuId={activeMenuId}
          setActiveMenuId={setActiveMenuId}
          onArchive={(u) => {
            setShowArchiveModal(true);
            setUserToArchive(u);
          }}
          onApprove={(u) => {
            setShowApproveModal(true);
            setUserToApprove(u);
          }}
          onReject={(u) => {
            setShowRejectModal(true);
            setUserToReject(u);
          }}
        />

        <TenantPagination
          itemsPerPage={itemsPerPage}
          setItemsPerPage={setItemsPerPage}
          totalItems={filteredUsers.length}
          currentPage={currentPage}
          setCurrentPage={setCurrentPage}
          totalPages={totalPages}
        />
      </main>

      <TenantModals
        showDetailsModal={showDetailsModal}
        selectedUser={selectedUser}
        onCloseDetails={() => {
          setShowDetailsModal(false);
          setSelectedUser(null);
        }}
        onApproveFromDetails={() => {
          setShowApproveModal(true);
          setUserToApprove(selectedUser);
        }}
        onRejectFromDetails={() => {
          setShowRejectModal(true);
          setUserToReject(selectedUser);
        }}
        onArchiveFromDetails={() => {
          setShowArchiveModal(true);
          setUserToArchive(selectedUser);
        }}
        isSubmitting={isSubmitting}
        showApproveModal={showApproveModal}
        onCloseApprove={() => setShowApproveModal(false)}
        onConfirmApprove={handleConfirmApprove}
        userToApprove={userToApprove}
        showRejectModal={showRejectModal}
        onCloseReject={() => setShowRejectModal(false)}
        onConfirmReject={handleConfirmReject}
        userToReject={userToReject}
        showArchiveModal={showArchiveModal}
        onCloseArchive={() => setShowArchiveModal(false)}
        onConfirmArchive={confirmArchiveUser}
        userToArchive={userToArchive}
      />
    </div>
  );
}

export default TenantManagement;

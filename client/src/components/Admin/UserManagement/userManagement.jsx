import React, { useEffect, useState } from "react";
import styles from "./userManagement.module.css";
import { API_BASE_URL } from "../../../utils/constants";
import toast from "react-hot-toast";
import UserDetailsModal from "./components/UserDetailsModal/UserDetailsModal";
import RejectionModal from "./components/RejectionModal/RejectionModal";
import ApprovalModal from "./components/ApproveModal/ApprovalModal";
import ArchiveConfirmationModal from "../ArchiveConfirmationModal/ArchiveConfirmationModal";
import { GridSkeleton } from "../../Skeletons";
import UserManagementHeader from "./components/UserManagementHeader";
import UserManagementTabs from "./components/UserManagementTabs";
import UserManagementGrid from "./components/UserManagementGrid";
import {
  Users,
  User,
  Store,
  Hospital,
  Home,
  Shield,
  Stethoscope,
  Briefcase,
  FileText,
} from "lucide-react";
import { Pagination } from "../../common";

function UserManagement() {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [activeTab, setActiveTab] = useState("all");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Approval logic
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [userToApprove, setUserToApprove] = useState(null);

  const handleOpenApprove = (user) => {
    setUserToApprove(user);
    setShowApproveModal(true);
  };

  const handleConfirmApprove = async () => {
    if (!userToApprove) return;
    const userId = userToApprove._id;
    setIsSubmitting(true);

    try {
      const token =
        localStorage.getItem("token") || sessionStorage.getItem("token");
      const res = await fetch(`${API_BASE_URL}/admin/users/${userId}/approve`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) {
        toast.success("User approved successfully");
        setUsers((prev) =>
          prev.map((u) =>
            u._id === userId
              ? { ...u, kycStatus: "approved", isVerified: true }
              : u,
          ),
        );
        // Update selected user if modal is open
        if (selectedUser && selectedUser._id === userId) {
          setSelectedUser({
            ...selectedUser,
            kycStatus: "approved",
            isVerified: true,
          });
        }
      } else {
        toast.error(data.message || "Failed to approve user");
      }
    } catch (err) {
      console.error(err);
      toast.error("Error approving user");
    } finally {
      setIsSubmitting(false);
      setShowApproveModal(false);
      setUserToApprove(null);
    }
  };

  // Rejection logic
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [userToReject, setUserToReject] = useState(null);

  const handleOpenReject = (user) => {
    setUserToReject(user);
    setShowRejectModal(true);
  };

  const handleConfirmReject = async (remark) => {
    if (!userToReject) return;
    const userId = userToReject._id;
    setIsSubmitting(true);

    try {
      const token =
        localStorage.getItem("token") || sessionStorage.getItem("token");
      const res = await fetch(`${API_BASE_URL}/admin/users/${userId}/reject`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ remark }),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success("User rejected");
        setUsers((prev) =>
          prev.map((u) =>
            u._id === userId
              ? { ...u, kycStatus: "rejected", isVerified: false }
              : u,
          ),
        );
        if (selectedUser && selectedUser._id === userId) {
          setSelectedUser({
            ...selectedUser,
            kycStatus: "rejected",
            isVerified: false,
          });
        }
      } else {
        toast.error(data.message || "Failed to reject user");
      }
    } catch (err) {
      console.error(err);
      toast.error("Error rejecting user");
    } finally {
      setIsSubmitting(false);
      setShowRejectModal(false);
      setUserToReject(null);
    }
  };

  // Archive modal state
  const [showArchiveModal, setShowArchiveModal] = useState(false);
  const [userToArchive, setUserToArchive] = useState(null);

  const tabs = [
    { id: "all", label: "All Users", icon: <Users size={18} /> },
    { id: "pending_kyc", label: "KYC Requests", icon: <FileText size={18} /> },
    { id: "user", label: "General", icon: <User size={18} /> },
    { id: "shop", label: "Shops", icon: <Store size={18} /> },
    { id: "hospital", label: "Hospitals", icon: <Hospital size={18} /> },
    { id: "doctor", label: "Doctors", icon: <Stethoscope size={18} /> },
    { id: "daycare", label: "Daycares", icon: <Home size={18} /> },
    { id: "caretaker", label: "Caretakers", icon: <Briefcase size={18} /> },
    { id: "ngo", label: "NGOs", icon: <Shield size={18} /> },
    { id: "admin", label: "Admins", icon: <Shield size={18} /> },
  ];
  useEffect(() => {
    let result = users;

    if (activeTab !== "all") {
      if (activeTab === "pending_kyc") {
        result = result.filter(
          (u) =>
            u.kycStatus === "pending" &&
            u.role !== "user" &&
            u.role !== "admin",
        );
      } else {
        result = result.filter((u) => u.role === activeTab);
      }
    }

    setFilteredUsers(result);
  }, [activeTab, users]);

  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab]);

  // Pagination Logic
  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
  const paginatedUsers = React.useMemo(() => {
    return filteredUsers.slice(
      (currentPage - 1) * itemsPerPage,
      currentPage * itemsPerPage,
    );
  }, [filteredUsers, currentPage, itemsPerPage]);

  const fetchUsers = async () => {
    try {
      const token =
        localStorage.getItem("token") || sessionStorage.getItem("token");
      const res = await fetch(`${API_BASE_URL}/admin/users`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json();
      if (res.ok) {
        setUsers(data);
        setFilteredUsers(data);
      } else {
        toast.error(data.message || "Failed to fetch users");
      }
    } catch {
      toast.error("Error fetching users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

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
      const data = await res.json();
      if (res.ok) {
        setUsers((prev) =>
          prev.map((u) =>
            u._id === userToArchive._id
              ? { ...u, isArchived: !u.isArchived }
              : u,
          ),
        );
        if (selectedUser && selectedUser._id === userToArchive._id) {
          setSelectedUser({
            ...selectedUser,
            isArchived: !selectedUser.isArchived,
          });
        }
        toast.success(data.message || "User status updated");
      } else {
        toast.error("Failed to update user status");
      }
    } catch {
      toast.error("Error updating user status");
    } finally {
      setIsSubmitting(false);
      setShowArchiveModal(false);
      setUserToArchive(null);
    }
  };

  const handleArchiveClick = (user, e) => {
    if (e) e.stopPropagation();
    setUserToArchive(user);
    setShowArchiveModal(true);
  };

  const handleViewDetails = (user) => {
    setSelectedUser(user);
    setShowDetailsModal(true);
  };

  if (loading) return <GridSkeleton count={8} />;

  return (
    <div className={styles.userManagement}>
      <UserManagementHeader />

      <UserManagementTabs
        tabs={tabs}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        users={users}
      />

      <UserManagementGrid
        filteredUsers={paginatedUsers}
        onClearFilters={() => {
          setActiveTab("all");
          setCurrentPage(1);
        }}
        onViewDetails={handleViewDetails}
        onArchive={handleArchiveClick}
        onApprove={handleOpenApprove}
        onReject={handleOpenReject}
      />

      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
        showPageInfo={true}
        className={styles.pagination}
      />

      {showDetailsModal && (
        <UserDetailsModal
          isOpen={showDetailsModal}
          onClose={() => {
            setShowDetailsModal(false);
            setSelectedUser(null);
          }}
          user={selectedUser}
          onApprove={() => handleOpenApprove(selectedUser)}
          onReject={() => handleOpenReject(selectedUser)}
          onArchive={() => handleArchiveClick(selectedUser)}
          isLoading={isSubmitting}
        />
      )}

      {showRejectModal && (
        <RejectionModal
          isOpen={showRejectModal}
          onClose={() => {
            setShowRejectModal(false);
            setUserToReject(null);
          }}
          onConfirm={handleConfirmReject}
          userName={userToReject?.name}
          isLoading={isSubmitting}
        />
      )}

      {showArchiveModal && (
        <ArchiveConfirmationModal
          isOpen={showArchiveModal}
          onClose={() => {
            setShowArchiveModal(false);
            setUserToArchive(null);
          }}
          onConfirm={confirmArchiveUser}
          itemType="user"
          itemName={userToArchive?.name}
          isArchived={userToArchive?.isArchived}
          isLoading={isSubmitting}
        />
      )}

      {showApproveModal && (
        <ApprovalModal
          isOpen={showApproveModal}
          onClose={() => {
            setShowApproveModal(false);
            setUserToApprove(null);
          }}
          onConfirm={handleConfirmApprove}
          userName={userToApprove?.name}
          isLoading={isSubmitting}
        />
      )}
    </div>
  );
}

export default UserManagement;

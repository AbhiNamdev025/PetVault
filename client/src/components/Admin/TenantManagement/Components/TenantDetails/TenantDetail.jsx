import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import styles from "./tenantDetail.module.css";
import toast from "react-hot-toast";
import { API_BASE_URL } from "../../../../../utils/constants";

// Modals
import ApprovalModal from "../../../UserManagement/components/ApproveModal/ApprovalModal";
import RejectionModal from "../../../UserManagement/components/RejectionModal/RejectionModal";
import ArchiveConfirmationModal from "../../../ArchiveConfirmationModal/ArchiveConfirmationModal";
import FileViewerModal from "../../../../common/fileViewer/FileViewerModal";

// Sub-components
import DetailHeader from "./components/DetailHeader/detailsHeader";
import DetailProfile from "./components/DetailProfile/detailsProfile";
import DetailInfo from "./components/DetailInfo/detailsInfo";
import DetailKYC from "./components/DetailKYC/detailsKYC";
import DetailNav from "./components/DetailNav/detailsNav";

const formatCurrency = (num) => {
  if (num >= 10000000) return (num / 10000000).toFixed(1) + "Cr";
  if (num >= 100000) return (num / 100000).toFixed(1) + "L";
  if (num >= 1000) return (num / 1000).toFixed(1) + "k";
  return num?.toString() || "0";
};

const TenantDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Interaction States
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [showArchiveModal, setShowArchiveModal] = useState(false);
  const [viewerFile, setViewerFile] = useState(null);

  useEffect(() => {
    fetchUserDetails();
  }, [id]);

  const fetchUserDetails = async () => {
    try {
      const token =
        localStorage.getItem("token") || sessionStorage.getItem("token");
      const response = await fetch(`${API_BASE_URL}/admin/users/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        setUserData(data);
      } else {
        toast.error("User not found");
        navigate("/admin/tenants");
      }
    } catch (error) {
      toast.error("Error fetching details");
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmApprove = async () => {
    setIsSubmitting(true);
    try {
      const token =
        localStorage.getItem("token") || sessionStorage.getItem("token");
      const res = await fetch(`${API_BASE_URL}/admin/users/${id}/approve`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        toast.success("Provider approved successfully");
        setUserData((prev) => ({
          ...prev,
          kycStatus: "approved",
          isVerified: true,
        }));
      } else {
        const data = await res.json();
        toast.error(data.message || "Failed to approve");
      }
    } catch (err) {
      toast.error("Error approving provider");
    } finally {
      setIsSubmitting(false);
      setShowApproveModal(false);
    }
  };

  const handleConfirmReject = async (remark) => {
    setIsSubmitting(true);
    try {
      const token =
        localStorage.getItem("token") || sessionStorage.getItem("token");
      const res = await fetch(`${API_BASE_URL}/admin/users/${id}/reject`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ remark }),
      });
      if (res.ok) {
        toast.success("Provider rejected");
        setUserData((prev) => ({
          ...prev,
          kycStatus: "rejected",
          isVerified: false,
          kycRemark: remark,
        }));
      } else {
        const data = await res.json();
        toast.error(data.message || "Failed to reject");
      }
    } catch (err) {
      toast.error("Error rejecting provider");
    } finally {
      setIsSubmitting(false);
      setShowRejectModal(false);
    }
  };

  const confirmArchiveUser = async () => {
    setIsSubmitting(true);
    try {
      const token =
        localStorage.getItem("token") || sessionStorage.getItem("token");
      const res = await fetch(`${API_BASE_URL}/admin/users/${id}/archive`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        toast.success(
          userData.isArchived ? "User unarchived" : "User archived",
        );
        setUserData((prev) => ({ ...prev, isArchived: !prev.isArchived }));
      } else {
        toast.error("Failed to update archive status");
      }
    } catch {
      toast.error("Error updating archive status");
    } finally {
      setIsSubmitting(false);
      setShowArchiveModal(false);
    }
  };

  if (loading) return <div className={styles.loading}>Loading details...</div>;
  if (!userData) return null;

  return (
    <div className={styles.pageContainer}>
      <DetailHeader
        onBack={() => navigate("/admin/tenants")}
        userData={userData}
        onArchive={() => setShowArchiveModal(true)}
        onApprove={() => setShowApproveModal(true)}
        onReject={() => setShowRejectModal(true)}
      />

      <div className={styles.mainContent}>
        <DetailProfile userData={userData} formatCurrency={formatCurrency} />

        <div className={styles.detailsGrid}>
          <DetailInfo userData={userData} />

          <DetailKYC
            userData={userData}
            onFileView={(file) => setViewerFile(file)}
          />
        </div>

        <DetailNav
          userData={userData}
          onDashboardClick={() =>
            navigate(
              `/admin/${userData.role === "shop" ? "shops" : userData.role === "hospital" ? "hospitals" : userData.role === "ngo" ? "ngos" : "daycares"}/${id}`,
            )
          }
        />

        {/* Modals */}
        {showApproveModal && (
          <ApprovalModal
            isOpen={showApproveModal}
            onClose={() => setShowApproveModal(false)}
            onConfirm={handleConfirmApprove}
            userName={userData?.name}
            isLoading={isSubmitting}
          />
        )}

        {showRejectModal && (
          <RejectionModal
            isOpen={showRejectModal}
            onClose={() => setShowRejectModal(false)}
            onConfirm={handleConfirmReject}
            userName={userData?.name}
            isLoading={isSubmitting}
          />
        )}

        {showArchiveModal && (
          <ArchiveConfirmationModal
            isOpen={showArchiveModal}
            onClose={() => setShowArchiveModal(false)}
            onConfirm={confirmArchiveUser}
            itemName={userData?.name}
            itemType="User/Provider"
            isArchived={userData?.isArchived}
            isLoading={isSubmitting}
          />
        )}

        {viewerFile && (
          <FileViewerModal
            file={{
              file: {
                url: viewerFile.url,
                fileName: viewerFile.name,
              },
              title: viewerFile.name,
            }}
            onClose={() => setViewerFile(null)}
          />
        )}
      </div>
    </div>
  );
};

export default TenantDetail;

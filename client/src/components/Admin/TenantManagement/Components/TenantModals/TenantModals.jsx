import React from "react";
import UserDetailsModal from "../../../UserManagement/components/UserDetailsModal/UserDetailsModal";
import RejectionModal from "../../../UserManagement/components/RejectionModal/RejectionModal";
import ApprovalModal from "../../../UserManagement/components/ApproveModal/ApprovalModal";
import ArchiveConfirmationModal from "../../../ArchiveConfirmationModal/ArchiveConfirmationModal";

const TenantModals = ({
  showDetailsModal,
  selectedUser,
  onCloseDetails,
  onApproveFromDetails,
  onRejectFromDetails,
  onArchiveFromDetails,
  isSubmitting,
  showApproveModal,
  onCloseApprove,
  onConfirmApprove,
  userToApprove,
  showRejectModal,
  onCloseReject,
  onConfirmReject,
  userToReject,
  showArchiveModal,
  onCloseArchive,
  onConfirmArchive,
  userToArchive,
}) => {
  return (
    <>
      {showDetailsModal && (
        <UserDetailsModal
          isOpen={showDetailsModal}
          onClose={onCloseDetails}
          user={selectedUser}
          onApprove={onApproveFromDetails}
          onReject={onRejectFromDetails}
          onArchive={onArchiveFromDetails}
          isLoading={isSubmitting}
        />
      )}

      {showApproveModal && (
        <ApprovalModal
          isOpen={showApproveModal}
          onClose={onCloseApprove}
          onConfirm={onConfirmApprove}
          userName={userToApprove?.name}
          isLoading={isSubmitting}
        />
      )}

      {showRejectModal && (
        <RejectionModal
          isOpen={showRejectModal}
          onClose={onCloseReject}
          onConfirm={onConfirmReject}
          userName={userToReject?.name}
          isLoading={isSubmitting}
        />
      )}

      {showArchiveModal && (
        <ArchiveConfirmationModal
          isOpen={showArchiveModal}
          onClose={onCloseArchive}
          onConfirm={onConfirmArchive}
          itemName={userToArchive?.name}
          itemType="User"
          isArchived={userToArchive?.isArchived}
          isLoading={isSubmitting}
        />
      )}
    </>
  );
};

export default TenantModals;

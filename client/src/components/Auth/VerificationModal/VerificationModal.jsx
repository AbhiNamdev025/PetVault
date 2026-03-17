import React, { useState } from "react";
import {
  AlertCircle,
  Clock,
  XCircle,
  Upload,
  CheckCircle2,
  ShieldOff,
} from "lucide-react";
import Modal from "../../common/Modal/Modal";
import styles from "./verificationModal.module.css";
import { Button } from "../../common";
import { BASE_URL } from "../../../utils/constants";
import toast from "react-hot-toast";
const VerificationModal = ({
  isOpen,
  onClose,
  status,
  message,
  userId,
  onResubmit,
  token: propToken,
  isInsideModal = false,
  showHeader = true,
}) => {
  const isRejected = status === "rejected";
  const isArchived = status === "archived";
  const [showUpload, setShowUpload] = useState(false);
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const handleFileChange = (e) => {
    const selected = Array.from(e.target.files);
    if (selected.length > 5) {
      toast.error("Max 5 files allowed");
      return;
    }
    setFiles(selected);
  };
  const handleUpload = async () => {
    if (files.length === 0) {
      toast.error("Please select files to upload");
      return;
    }
    setUploading(true);
    const formData = new FormData();
    files.forEach((file) => {
      formData.append("kycDocuments", file);
    });
    try {
      const token =
        propToken ||
        localStorage.getItem("token") ||
        sessionStorage.getItem("token");
      const res = await fetch(`${BASE_URL}/api/user/${userId}/resubmit-kyc`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });
      if (!res.ok) throw new Error("Failed to upload");
      toast.success("Documents submitted! Please wait for approval.");
      if (onResubmit) {
        onResubmit();
      } else {
        onClose();
      }
    } catch (err) {
      toast.error(err.message || "Upload failed");
    } finally {
      setUploading(false);
    }
  };
  const content = (
    <div className={styles.modalContent}>
      {isArchived ? (
        <ShieldOff
          className={styles.warningIcon}
          style={{
            color: "var(--color-error)",
          }}
        />
      ) : isRejected ? (
        <XCircle
          className={styles.warningIcon}
          style={{
            color: "var(--color-error)",
          }}
        />
      ) : (
        <Clock className={styles.warningIcon} />
      )}

      {showHeader && (
        <h2 className={styles.title}>
          {isArchived
            ? "Access Blocked"
            : isRejected
              ? "Action Required"
              : "Please Wait"}
        </h2>
      )}

      {!isRejected && !isArchived && (
        <p className={styles.message}>
          {message ||
            "Your account verification is currently in progress. Please check back later."}
        </p>
      )}

      {isRejected && (
        <div className={styles.remarkBox}>
          <span className={styles.remarkLabel}>Reason for Rejection</span>
          <p className={styles.remarkText}>
            {message && message !== "Your verification was rejected."
              ? message
              : "Please review the documents and try again."}
          </p>
          <p className={styles.noteText}>
            Please upload valid KYC documents as per the requirements.
          </p>
        </div>
      )}

      {isArchived && (
        <div className={styles.remarkBox}>
          <span className={styles.remarkLabel}>Account Status</span>
          <p className={styles.remarkText}>
            {message ||
              "Your account has been deactivated by the administrator."}
          </p>
          <p className={styles.noteText}>
            If you believe this is a mistake, please contact our support team.
          </p>
        </div>
      )}

      {!showUpload && (
        <div className={styles.actions}>
          {isRejected ||
          (status === "pending" &&
            (!message ||
              message.includes("in progress") ||
              message.includes("needs verification"))) ? (
            <>
              <Button
                fullWidth
                onClick={() => setShowUpload(true)}
                variant="primary"
                className={styles.actionBtn}
                size="md"
              >
                {status === "pending"
                  ? "Upload Verification Docs"
                  : "Resubmit Documents"}
              </Button>
              <Button
                fullWidth
                onClick={onClose}
                variant="outline"
                className={styles.actionBtn}
                size="md"
              >
                Close
              </Button>
            </>
          ) : isArchived ? (
            <Button
              fullWidth
              onClick={onClose}
              variant="danger"
              style={{
                background: "var(--color-error)",
              }}
              size="md"
            >
              Close
            </Button>
          ) : (
            <Button fullWidth onClick={onClose} variant="primary" size="md">
              Okay, I understand
            </Button>
          )}
        </div>
      )}

      {(isRejected || status === "pending") && showUpload && (
        <div className={styles.uploadSection}>
          <label className={styles.fileLabel}>
            <Upload size={16} />
            <span>Upload New Documents</span>
            <input
              type="file"
              multiple
              accept="image/*,application/pdf"
              onChange={handleFileChange}
              className={styles.fileInput}
            />
          </label>
          {files.length > 0 && (
            <span className={styles.fileCount}>
              {files.length} file(s) selected
            </span>
          )}

          <div className={styles.actionRow}>
            <Button
              onClick={() => {
                setShowUpload(false);
                setFiles([]);
              }}
              variant="ghost"
              disabled={uploading}
              className={styles.cancelBtn}
              size="md"
            >
              Cancel
            </Button>
            <Button
              onClick={handleUpload}
              variant="primary"
              isLoading={uploading}
              disabled={files.length === 0}
              className={styles.submitBtn}
              size="md"
            >
              {uploading ? "Uploading..." : "Submit Documents"}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
  if (isInsideModal) return content;
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        isArchived
          ? "Account Deactivated"
          : isRejected
            ? "Verification Rejected"
            : "Verification Pending"
      }
      size="sm"
      hideContentPadding
    >
      {content}
    </Modal>
  );
};
export default VerificationModal;

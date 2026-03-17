import React from "react";
import { User, Mail, Phone, MapPin, Shield, Calendar, Stethoscope, GraduationCap, Hospital, Store, Clock, Image as ImageIcon, CheckCircle2, ExternalLink, Info, Building2, Briefcase, FileText, Check, X, Archive, RotateCcw } from "lucide-react";
import Modal from "../../../../common/Modal/Modal";
import styles from "./userDetailsModal.module.css";
import { BASE_URL } from "../../../../../utils/constants";
import FileViewerModal from "../../../../common/fileViewer/FileViewerModal";
import { Button } from "../../../../common";
const UserDetailsModal = ({
  isOpen,
  onClose,
  user,
  onApprove,
  onReject,
  onArchive,
  isLoading
}) => {
  if (!user) return null;
  const [viewerFile, setViewerFile] = React.useState(null);
  const formatDate = dateString => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric"
    });
  };
  const renderAvailability = () => {
    if (!user.availability) return null;
    return <div className={styles.availabilityBox}>
        <div className={styles.availabilityRow}>
          <Clock size={14} />
          <span>
            {user.availability.startTime} - {user.availability.endTime}
          </span>
        </div>
        <div className={styles.daysList}>
          {user.availability.days?.map((day, idx) => <span key={idx} className={styles.dayBadge}>
              {day}
            </span>) || "No days specified"}
        </div>
      </div>;
  };
  const renderRoleSpecificData = () => {
    const {
      role,
      roleData
    } = user;
    if (!roleData) return null;

    // Generic display for all provider roles
    return <div className={styles.roleContent}>
        <div className={styles.infoRowDetailed}>
          <User size={18} />
          <div className={styles.infoText}>
            <p className={styles.infoLabelDetailed}>Entity / Practice Name</p>
            <p className={styles.infoValueDetailed}>
              {roleData.entityName || roleData.shopName || roleData.hospitalName || "N/A"}
            </p>
          </div>
        </div>

        {/* Legacy specific fields fallback if necessary */}
        {roleData.doctorSpecialization && <div className={styles.infoRowDetailed}>
            <Stethoscope size={18} />
            <div className={styles.infoText}>
              <p className={styles.infoLabelDetailed}>Specialization</p>
              <p className={styles.infoValueDetailed}>
                {roleData.doctorSpecialization}
              </p>
            </div>
          </div>}
      </div>;
  };
  return <Modal isOpen={isOpen} onClose={onClose} title="User Details" size="md">
      <div className={styles.container}>
        <div className={styles.banner}>
          <img src={user.avatar ? `${BASE_URL}/uploads/avatars/${user.avatar}` : "https://via.placeholder.com/150"} alt={user.name} className={styles.avatarMain} />
          <div className={styles.headerInfo}>
            <h2 className={styles.userName}>{user.name}</h2>
            <div className={styles.roleRow}>
              <Shield size={12} />
              <span className={`${styles.roleTag} ${styles[user.role]}`}>
                {user.role}
              </span>
              {user.role !== "user" && user.role !== "admin" && <>
                  <span className={styles.dot}>•</span>
                  <span className={`${styles.statusTag} ${styles[user.kycStatus || "pending"]}`}>
                    {user.kycStatus || "pending"}
                  </span>
                </>}
              {user.isArchived && <>
                  <span className={`${styles.statusTag} ${styles.archivedBadge}`}>
                    Archived
                  </span>
                  <span className={styles.dot}>•</span>
                </>}
              <span className={styles.joinedLabel}>
                Joined {formatDate(user.createdAt)}
              </span>
            </div>
          </div>
        </div>

        <div className={`${styles.mainGrid} ${user.role === "user" || user.role === "admin" ? styles.singleCol : ""}`}>
          <div className={styles.glassCard}>
            <h3 className={styles.cardTitle}>Account Infomation</h3>
            <div className={styles.credentialsList}>
              <div className={styles.credItem}>
                <Mail size={14} />
                <div className={styles.credText}>
                  <p className={styles.credLabel}>Email</p>
                  <p className={styles.credValue}>{user.email}</p>
                </div>
              </div>
              <div className={styles.credItem}>
                <Phone size={14} />
                <div className={styles.credText}>
                  <p className={styles.credLabel}>Phone</p>
                  <p className={styles.credValue}>{user.phone || "N/A"}</p>
                </div>
              </div>
              <div className={styles.credItem}>
                <MapPin size={14} />
                <div className={styles.credText}>
                  <p className={styles.credLabel}>Address</p>
                  <p className={styles.credValue}>
                    {user.address ? `${user.address.street}, ${user.address.city}` : "N/A"}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {user.role !== "user" && user.role !== "admin" && <div className={styles.glassCard}>
              <h3 className={styles.cardTitle}>Professional Details</h3>
              {renderRoleSpecificData()}
              {renderAvailability()}
            </div>}
        </div>

        {user.roleData && (user.roleData.hospitalImages && user.roleData.hospitalImages.length > 0 || user.roleData.doctorImages && user.roleData.doctorImages.length > 0 || user.roleData.shopImages && user.roleData.shopImages.length > 0 || user.roleData.daycareImages && user.roleData.daycareImages.length > 0 || user.roleData.serviceImages && user.roleData.serviceImages.length > 0) && <div className={styles.glassCard}>
              <h3 className={styles.cardTitle}>Profile Gallery</h3>
              <div className={styles.gallery}>
                {(user.roleData.hospitalImages || user.roleData.doctorImages || user.roleData.shopImages || user.roleData.daycareImages || user.roleData.serviceImages || []).map((img, idx) => <img key={idx} src={`${BASE_URL}/uploads/${user.role === "daycare" ? "daycares" : user.role + "s"}/${img}`} alt="Gallery" className={styles.galleryImg} />)}
              </div>
            </div>}

        {/* Verification Documents Section */}
        {user.kycDocuments && user.kycDocuments.length > 0 ? <div className={styles.glassCard}>
            <h3 className={styles.cardTitle}>KYC Documents</h3>
            <div className={styles.gallery}>
              {user.kycDocuments.map((doc, idx) => {
            const url = doc.startsWith("http") ? doc : `${BASE_URL}/uploads/docs/${doc}`;
            return <Button key={idx} onClick={() => setViewerFile({
              url,
              name: doc
            })} className={styles.docItem} variant="primary" size="md">
                    <FileText size={16} />
                    <span className={styles.docName} title={doc}>
                      Document {idx + 1}
                    </span>
                    <ExternalLink size={12} />
                  </Button>;
          })}
            </div>
          </div> : user.role !== "user" && user.kycStatus === "pending" && <div className={styles.glassCard}>
              <h3 className={styles.cardTitle}>KYC Documents</h3>
              <p className={styles.descriptionText}>No documents uploaded.</p>
            </div>}

        <div className={styles.footer}>
          {user.role !== "user" && user.role !== "admin" ? <div className={styles.actionFooter}>
              <Button className={`${styles.btn} ${styles.outline}`} onClick={() => onArchive(user._id)} disabled={isLoading} variant="outline" size="md">
                {isLoading ? <div className={styles.loader}></div> : user.isArchived ? <>
                    <RotateCcw size={14} /> Unarchive
                  </> : <>
                    <Archive size={14} /> Archive
                  </>}
              </Button>

              {user.kycStatus !== "approved" ? <>
                  <Button className={`${styles.btn} ${styles.red}`} onClick={() => onReject(user._id)} disabled={isLoading} variant="primary" size="md">
                    {isLoading ? <div className={styles.loader}></div> : <>
                        <X size={14} />{" "}
                        {user.kycStatus === "rejected" ? "Update Remark" : "Reject"}
                      </>}
                  </Button>
                  <Button className={`${styles.btn} ${styles.green}`} onClick={() => onApprove(user._id)} disabled={isLoading} variant="primary" size="md">
                    {isLoading ? <div className={styles.loader}></div> : <>
                        <Check size={14} /> Approve
                      </>}
                  </Button>
                </> : <Button className={`${styles.btn} ${styles.red}`} onClick={() => onReject(user._id)} disabled={isLoading} variant="primary" size="md">
                  {isLoading ? <div className={styles.loader}></div> : <>
                      <X size={14} /> Revoke Approval
                    </>}
                </Button>}
              <Button className={styles.closeBtn} style={{
            background: "var(--color-neutral-500)"
          }} onClick={onClose} disabled={isLoading} variant="ghost" size="sm">
                Close
              </Button>
            </div> : <Button className={styles.closeBtn} onClick={onClose} disabled={isLoading} variant="ghost" size="sm">
              Close
            </Button>}
        </div>
      </div>
      {viewerFile && <FileViewerModal file={{
      file: {
        url: viewerFile.url,
        fileName: viewerFile.name
      },
      title: viewerFile.name
    }} onClose={() => setViewerFile(null)} />}
    </Modal>;
};
export default UserDetailsModal;

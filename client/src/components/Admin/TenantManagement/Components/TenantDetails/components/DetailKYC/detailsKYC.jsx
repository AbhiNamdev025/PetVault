import React from "react";
import styles from "./detailKYC.module.css";
import { FileText, ExternalLink } from "lucide-react";
import { BASE_URL } from "../../../../../../../utils/constants";
import { Button } from "../../../../../../common";

const DetailKYC = ({ userData, onFileView }) => {
  return (
    <div className={styles.detailCard}>
      <h3>KYC & Verification</h3>
      <div className={styles.infoList}>
        <div className={styles.infoItem}>
          <span className={styles.infoKey}>Current Status:</span>
          <span className={`${styles.infoValue} ${styles[userData.kycStatus]}`}>
            {userData.kycStatus.toUpperCase()}
          </span>
        </div>

        <div className={styles.infoItem}>
          <span className={styles.infoKey}>Verification Documents:</span>
          <div className={styles.infoValue}>
            {userData.kycDocuments && userData.kycDocuments.length > 0 ? (
              <div className={styles.docGallery}>
                {userData.kycDocuments.map((doc, idx) => {
                  const url = doc.startsWith("http")
                    ? doc
                    : `${BASE_URL}/uploads/docs/${doc}`;
                  return (
                    <Button
                      key={idx}
                      className={styles.docItem}
                      onClick={() => onFileView({ url, name: doc })}
                      variant="primary"
                      size="md"
                    >
                      <FileText size={16} />
                      <span>Document {idx + 1}</span>
                      <ExternalLink size={12} className={styles.docIcon} />
                    </Button>
                  );
                })}
              </div>
            ) : (
              <span className={styles.noDocs}>No documents uploaded.</span>
            )}
          </div>
        </div>

        {userData.kycRemark && (
          <div className={styles.infoItem}>
            <span className={styles.infoKey}>Admin Remark:</span>
            <div className={styles.infoValue}>
              <div className={styles.remarkBox}>
                <p className={styles.remarkValue}>{userData.kycRemark}</p>
              </div>
            </div>
          </div>
        )}

        <div className={styles.infoItem}>
          <span className={styles.infoKey}>Verified:</span>
          <span className={styles.infoValue}>
            {userData.isVerified ? "Yes" : "No"}
          </span>
        </div>

        <div className={styles.infoItem}>
          <span className={styles.infoKey}>Archived:</span>
          <span className={styles.infoValue}>
            {userData.isArchived ? "Yes" : "No"}
          </span>
        </div>
      </div>
    </div>
  );
};

export default DetailKYC;


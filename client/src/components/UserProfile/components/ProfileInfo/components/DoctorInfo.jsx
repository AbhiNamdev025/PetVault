import React from "react";
import { Stethoscope, BookOpen, FileText } from "lucide-react";
import styles from "../profileInfo.module.css";
import AddressInfo from "./AddressInfo";

const DoctorInfo = ({ roleData, address }) => {
  const qualifications = roleData?.doctorQualifications || {};

  return (
    <div className={styles.roleSection}>
      <div className={styles.sideCard}>
        <div className={styles.sideCardTitle}>
          <Stethoscope size={18} />
          Professional Information
        </div>
        <div className={styles.infoGrid}>
          {roleData.doctorSpecialization && (
            <div>
              <div className={styles.infoLabel}>Specialization</div>
              <div className={styles.infoValue}>
                {roleData.doctorSpecialization}
              </div>
            </div>
          )}
          {roleData.doctorExperience && (
            <div>
              <div className={styles.infoLabel}>Experience</div>
              <div className={styles.infoValue}>
                {roleData.doctorExperience} Years
              </div>
            </div>
          )}
          {roleData.consultationFee && (
            <div>
              <div className={styles.infoLabel}>Consultation Fee</div>
              <div className={styles.infoValue}>
                ₹{roleData.consultationFee}
              </div>
            </div>
          )}
          {roleData.hospitalName && (
            <div>
              <div className={styles.infoLabel}>Hospital</div>
              <div className={styles.infoValue}>{roleData.hospitalName}</div>
            </div>
          )}
        </div>
      </div>

      <AddressInfo address={address} />

      {(qualifications.degree ||
        qualifications.institution ||
        qualifications.yearOfCompletion ||
        qualifications.licenseNumber ||
        qualifications.certifications?.length > 0 ||
        qualifications.skills?.length > 0 ||
        qualifications.languages?.length > 0) && (
        <div className={styles.sideCard}>
          <div className={styles.sideCardTitle}>
            <BookOpen size={18} />
            Qualifications & Certifications
          </div>
          <div className={styles.infoGrid}>
            {qualifications.degree && (
              <div>
                <div className={styles.infoLabel}>Degree</div>
                <div className={styles.infoValue}>{qualifications.degree}</div>
              </div>
            )}
            {qualifications.institution && (
              <div>
                <div className={styles.infoLabel}>Institution</div>
                <div className={styles.infoValue}>
                  {qualifications.institution}
                </div>
              </div>
            )}
            {qualifications.yearOfCompletion && (
              <div>
                <div className={styles.infoLabel}>Year Completed</div>
                <div className={styles.infoValue}>
                  {qualifications.yearOfCompletion}
                </div>
              </div>
            )}
            {qualifications.licenseNumber && (
              <div>
                <div className={styles.infoLabel}>License Number</div>
                <div className={styles.infoValue}>
                  {qualifications.licenseNumber}
                </div>
              </div>
            )}
            {qualifications.certifications?.length > 0 && (
              <div style={{ gridColumn: "1 / -1" }}>
                <div className={styles.infoLabel}>Certifications</div>
                <div className={styles.certificationsList}>
                  {qualifications.certifications.map((cert, index) => (
                    <div key={index} className={styles.certificationItem}>
                      <FileText className={styles.certIcon} />
                      <span className={styles.certItemText}>{cert}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {qualifications.skills?.length > 0 && (
              <div style={{ gridColumn: "1 / -1" }}>
                <div className={styles.infoLabel}>Skills</div>
                <div className={styles.servicesList}>
                  {qualifications.skills.map((skill, index) => (
                    <span key={index} className={styles.serviceTag}>
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}
            {qualifications.languages?.length > 0 && (
              <div style={{ gridColumn: "1 / -1" }}>
                <div className={styles.infoLabel}>Languages</div>
                <div className={styles.servicesList}>
                  {qualifications.languages.map((lang, index) => (
                    <span key={index} className={styles.serviceTag}>
                      {lang}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default DoctorInfo;

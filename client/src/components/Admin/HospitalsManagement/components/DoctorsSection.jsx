import React from "react";
import { Stethoscope } from "lucide-react";
import styles from "../hospitalDetail.module.css";

const DoctorsSection = ({ doctors, baseUrl, onRowClick }) => {
  return (
    <div className={styles.section}>
      <div className={styles.sectionHeader}>
        <Stethoscope size={20} />
        <h2>Doctors</h2>
      </div>
      <div className={styles.tableContainer}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Doctor Name</th>
              <th>Specialization</th>
              <th>Experience</th>
              <th>Contact</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {doctors.length > 0 ? (
              doctors.map((doctor) => (
                <tr
                  key={doctor._id}
                  className={`${styles.clickableRow} ${
                    doctor.isArchived ? styles.archivedRow : ""
                  }`}
                  onClick={() => onRowClick(doctor)}
                >
                  <td data-label="Doctor Name">
                    <div className={styles.doctorName}>
                      {doctor.image ? (
                        <img
                          src={`${baseUrl}/uploads/roleImages/${doctor.image}`}
                          alt={doctor.name}
                          className={styles.doctorImage}
                        />
                      ) : (
                        <div className={styles.avatarPlaceholder}>
                          {doctor.name[0]}
                        </div>
                      )}
                      <span>{doctor.name}</span>
                      {doctor.isArchived && (
                        <span className={styles.archivedBadge}>Archived</span>
                      )}
                    </div>
                  </td>
                  <td data-label="Specialization">
                    {doctor.specialization}
                  </td>
                  <td data-label="Experience">{doctor.experience} years</td>
                  <td data-label="Contact">{doctor.email}</td>
                  <td data-label="Status">
                    <span className={styles.activeBadge}>
                      {doctor.isArchived ? "Inactive" : "Active"}
                    </span>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" className={styles.noData}>
                  No doctors registered in this hospital
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DoctorsSection;

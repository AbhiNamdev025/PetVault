import React from "react";
import { Calendar, IndianRupee, Trash2, Users } from "lucide-react";
import styles from "../hospitalDetail.module.css";

const formatCurrency = (num) => {
  if (num >= 10000000) return (num / 10000000).toFixed(1) + "Cr";
  if (num >= 100000) return (num / 100000).toFixed(1) + "L";
  if (num >= 1000) return (num / 1000).toFixed(1) + "k";
  return num?.toString() || "0";
};

const HospitalStatsGrid = ({
  hospital,
  doctorCount,
  archivedCount,
  totalAppointments,
  pendingAppointments,
}) => {
  return (
    <div className={styles.statsGrid}>
      <div className={styles.statCard}>
        <Users size={24} />
        <div>
          <h3>{doctorCount}</h3>
          <p>Total Doctors</p>
        </div>
      </div>
      <div className={`${styles.statCard} ${styles.earningCard}`}>
        <IndianRupee size={24} />
        <div>
          <h3>₹{formatCurrency(hospital.lifetime_earning || 0)}</h3>
          <p>Lifetime Earning</p>
        </div>
      </div>
      <div className={`${styles.statCard} ${styles.archivedCard}`}>
        <Trash2 size={24} />
        <div>
          <h3>{archivedCount}</h3>
          <p>Archived Doctors</p>
        </div>
      </div>
      <div className={styles.statCard}>
        <Calendar size={24} />
        <div>
          <h3>{totalAppointments}</h3>
          <p>Total Appointments</p>
        </div>
      </div>
      <div className={`${styles.statCard} ${styles.pendingCard}`}>
        <Calendar size={24} />
        <div>
          <h3>{pendingAppointments}</h3>
          <p>Pending Appointments</p>
        </div>
      </div>
    </div>
  );
};

export default HospitalStatsGrid;

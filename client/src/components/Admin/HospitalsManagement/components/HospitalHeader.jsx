import React from "react";
import { Calendar, Hospital, Mail, Phone, Shield } from "lucide-react";
import styles from "../hospitalDetail.module.css";
import { Button } from "../../../common";
const HospitalHeader = ({
  hospital,
  onAccountActions
}) => {
  return <div className={styles.hospitalHeader}>
      <div className={styles.hospitalIcon}>
        <Hospital size={32} />
      </div>
      <div className={styles.hospitalInfo}>
        <h1>{hospital.hospital_name}</h1>
        <div className={styles.hospitalMeta}>
          <span>
            <Mail size={16} />
            {hospital.owner_email}
          </span>
          {hospital.owner_phone && <span>
              <Phone size={16} />
              {hospital.owner_phone}
            </span>}
          <span>
            <Calendar size={16} />
            Registered {new Date(hospital.registered_date).toLocaleDateString()}
          </span>
        </div>
      </div>
      <div className={styles.headerActions}>
        <Button className={styles.accountBtn} onClick={onAccountActions} variant="primary" size="md">
          <Shield size={18} />
          Account Actions
        </Button>
      </div>
    </div>;
};
export default HospitalHeader;

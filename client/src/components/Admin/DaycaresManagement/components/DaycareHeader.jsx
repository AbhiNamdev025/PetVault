import React from "react";
import { Calendar, Home, Mail, Phone, Shield } from "lucide-react";
import styles from "../daycareDetail.module.css";
import { Button } from "../../../common";
const DaycareHeader = ({
  daycare,
  onAccountActions
}) => {
  return <div className={styles.daycareHeader}>
      <div className={styles.daycareIcon}>
        <Home size={32} />
      </div>
      <div className={styles.daycareInfo}>
        <h1>{daycare.daycare_name}</h1>
        <div className={styles.daycareMeta}>
          <span>
            <Mail size={16} />
            {daycare.owner_email}
          </span>
          {daycare.owner_phone && <span>
              <Phone size={16} />
              {daycare.owner_phone}
            </span>}
          <span>
            <Calendar size={16} />
            Registered {new Date(daycare.registered_date).toLocaleDateString()}
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
export default DaycareHeader;

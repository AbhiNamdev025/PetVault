import React from "react";
import { BoxSelect, Calendar, Heart, Mail, MapPin, Phone, Shield } from "lucide-react";
import styles from "../ngoDetail.module.css";
import { Button } from "../../../common";
const NgoHeader = ({
  ngo,
  onAccountActions
}) => {
  return <div className={styles.shopHeader}>
      <div className={styles.shopIcon}>
        <Heart size={40} />
      </div>
      <div className={styles.shopInfo}>
        <h1>{ngo.ngo_name !== "N/A" ? ngo.ngo_name : ngo.owner_name}</h1>
        <div className={styles.shopMeta}>
          <span>
            <Mail size={16} /> {ngo.owner_email}
          </span>
          {ngo.owner_phone && <span>
              <Phone size={16} /> {ngo.owner_phone}
            </span>}
          {ngo.ngo_address && <span>
              <MapPin size={16} /> {ngo.ngo_address}
            </span>}
          <span>
            <BoxSelect size={16} /> Capacity: {ngo.ngo_capacity}
          </span>
          <span>
            <Calendar size={16} /> Joined{" "}
            {new Date(ngo.registered_date).toLocaleDateString()}
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
export default NgoHeader;

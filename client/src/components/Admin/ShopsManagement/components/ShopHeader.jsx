import React from "react";
import { Calendar, Mail, Phone, Shield, Store } from "lucide-react";
import styles from "../shopDetail.module.css";
import { Button } from "../../../common";
const ShopHeader = ({
  shop,
  onAccountActions
}) => {
  return <div className={styles.shopHeader}>
      <div className={styles.shopIcon}>
        <Store size={32} />
      </div>
      <div className={styles.shopInfo}>
        <h1>{shop.shop_name}</h1>
        <div className={styles.shopMeta}>
          <span>
            <Mail size={16} />
            {shop.owner_email}
          </span>
          {shop.owner_phone && <span>
              <Phone size={16} />
              {shop.owner_phone}
            </span>}
          <span>
            <Calendar size={16} />
            Registered {new Date(shop.registered_date).toLocaleDateString()}
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
export default ShopHeader;

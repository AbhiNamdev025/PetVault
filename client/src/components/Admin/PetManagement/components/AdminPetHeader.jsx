import React from "react";
import { Activity, Calendar, Heart, PawPrint, Store, Trash2 } from "lucide-react";
import styles from "../AdminPetDetail.module.css";
import { Button } from "../../../common";
const AdminPetHeader = ({
  pet,
  onDelete,
  onRestore,
  onNavigateToTenant
}) => {
  return <div className={styles.shopHeader}>
      <div className={styles.shopIcon} data-archived={pet.isArchived}>
        <PawPrint size={40} />
      </div>
      <div className={styles.shopInfo}>
        <div className={styles.headerTop}>
          <div className={styles.titleSection}>
            <h1 className={pet.isArchived ? styles.archivedTitle : ""}>
              {pet.name} {pet.isArchived && "(Archived)"}
            </h1>
            <div className={styles.shopMeta}>
              {pet.shopId && <span onClick={() => onNavigateToTenant(pet.shopId._id)} className={styles.shopLink}>
                  <Store size={16} /> Shop: {pet.shopId.name}
                </span>}
              {pet.ngoId && <span onClick={() => onNavigateToTenant(pet.ngoId._id)} className={styles.ngoLink}>
                  <Heart size={16} /> NGO: {pet.ngoId.name}
                </span>}
              <span>
                <Activity size={16} /> {pet.breed} ({pet.type})
              </span>
              <span>
                <Calendar size={16} /> Added{" "}
                {new Date(pet.createdAt).toLocaleDateString()}
              </span>
            </div>
          </div>
          <div className={styles.actions}>
            {pet.isArchived ? <Button className={`${styles.actionBtn} ${styles.restore}`} onClick={onRestore} variant="primary" size="md">
                Restore Pet
              </Button> : <Button className={`${styles.actionBtn} ${styles.delete}`} onClick={onDelete} variant="danger" size="md">
                <Trash2 size={18} /> Archive Pet
              </Button>}
          </div>
        </div>
      </div>
    </div>;
};
export default AdminPetHeader;

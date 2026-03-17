import React from "react";
import { Calendar, Package, RotateCcw, Store, Tag, Trash2 } from "lucide-react";
import styles from "../AdminProductDetail.module.css";
import { Button } from "../../../common";
const AdminProductHeader = ({
  product,
  onDelete,
  onRestore,
  onNavigateToTenant
}) => {
  return <div className={styles.shopHeader}>
      <div className={styles.shopIcon} data-archived={product.isArchived}>
        <Package size={40} />
      </div>
      <div className={styles.shopInfo}>
        <div className={styles.headerTop}>
          <div className={styles.titleSection}>
            <h1 className={product.isArchived ? styles.archivedTitle : ""}>
              {product.name} {product.isArchived && "(Archived)"}
            </h1>
            <div className={styles.shopMeta}>
              {product.shopId && <span onClick={() => onNavigateToTenant(product.shopId._id)} className={styles.shopLink}>
                  <Store size={16} /> Shop: {product.shopId.name}
                </span>}
              <span>
                <Tag size={16} /> {product.category}
              </span>
              <span>
                <Calendar size={16} /> Added On {" "}
                {new Date(product.createdAt).toLocaleDateString()}
              </span>
            </div>
          </div>
          <div className={styles.actions}>
            {product.isArchived ? <Button className={`${styles.actionBtn} ${styles.restore}`} onClick={onRestore} variant="primary" size="md">
                <RotateCcw size={18} /> Restore Product
              </Button> : <Button className={`${styles.actionBtn} ${styles.delete}`} onClick={onDelete} variant="danger" size="md">
                <Trash2 size={18} /> Archive Product
              </Button>}
          </div>
        </div>
      </div>
    </div>;
};
export default AdminProductHeader;

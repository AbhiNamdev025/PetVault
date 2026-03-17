import React from "react";
import { Trash2, Eye, Store, RotateCcw } from "lucide-react";
import styles from "../productManagement.module.css";
import { Button } from "../../../common";
const ProductCard = ({
  product,
  viewMode,
  baseUrl,
  onCardClick,
  onView,
  onDelete,
  onRestore,
  onShopClick
}) => {
  return <div className={styles.productCard} onClick={() => onCardClick(product)}>
      <div className={styles.productImage}>
        {product.images && product.images.length > 0 ? <img src={`${baseUrl}/uploads/products/${product.images[0]}`} alt={product.name} /> : <div className={styles.noImage}>No Image</div>}
        <div className={styles.productStock}>
          <span className={`${styles.stock} ${product.stock > 0 ? styles.inStock : styles.outOfStock}`}>
            {product.stock > 0 ? `${product.stock} in stock` : "Out of stock"}
          </span>
        </div>
      </div>

      <div className={styles.productInfo}>
        <h3 className={styles.itemName}>{product.name}</h3>
        <p className={styles.brand}>{product.brand || product.category}</p>

        <div className={styles.infoRow}>
          {product.shopId && <div className={styles.shopInfo} onClick={e => {
          e.stopPropagation();
          onShopClick(product);
        }} style={{
          cursor: "pointer"
        }}>
              <Store size={14} />
              <span className={styles.shopName}>
                {typeof product.shopId === "object" ? product.shopId.name || product.shopId._id : product.shopId}
              </span>
            </div>}
          <div className={styles.price}>₹{product.price}</div>
        </div>

        <div className={styles.actions}>
          {viewMode === "active" ? <>
              <Button className={styles.viewBtn} onClick={e => {
            e.stopPropagation();
            onView(product);
          }} variant="ghost" size="md">
                <Eye size={16} /> View
              </Button>
              <Button className={styles.deleteBtn} onClick={e => {
            e.stopPropagation();
            onDelete(product);
          }} variant="danger" size="md">
                <Trash2 size={16} /> Delete
              </Button>
            </> : <Button className={styles.restoreBtn} onClick={e => {
          e.stopPropagation();
          onRestore(product);
        }} variant="primary" size="md">
              <RotateCcw size={16} /> Restore
            </Button>}
        </div>
      </div>
    </div>;
};
export default ProductCard;

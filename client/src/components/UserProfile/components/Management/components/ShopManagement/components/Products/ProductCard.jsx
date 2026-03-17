import React from "react";
import { Edit, Trash2 } from "lucide-react";
import { API_BASE_URL } from "../../../../../../../../utils/constants";
import styles from "../ShopProducts/ShopProducts.module.css";
import { Button } from "../../../../../../../common";
import ManagementCard from "../../../common/ManagementCard";

const ProductCard = ({ product, onEdit, onDelete }) => {
  const isAvail = product.available !== false;
  const stock = Number(product.stock || 0);
  const imageUrl = product.images?.[0]
    ? `${API_BASE_URL.replace("/api", "")}/uploads/products/${product.images[0]}`
    : null;

  const actions = [
    <Button
      key="edit"
      className={styles.editBtn}
      onClick={() => onEdit(product)}
      variant="primary"
      size="md"
    >
      <Edit size={16} />
    </Button>,
    <Button
      key="delete"
      className={styles.delBtn}
      onClick={() => onDelete(product)}
      variant="danger"
      size="md"
    >
      <Trash2 size={16} />
    </Button>,
  ];

  const badgeContent = !isAvail
    ? "Unavailable"
    : stock > 0
      ? `${stock} in stock`
      : "Out of Stock";

  const badgeVariant = !isAvail || stock <= 0 ? "danger" : "success";

  return (
    <ManagementCard
      image={imageUrl}
      title={product.name}
      subtitle={product.brand || "Generic"}
      price={`₹${product.price}`}
      badge={badgeContent}
      badgeVariant={badgeVariant}
      actions={actions}
    />
  );
};
export default ProductCard;

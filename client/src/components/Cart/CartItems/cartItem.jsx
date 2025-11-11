import React from "react";
import styles from "./CartItem.module.css";
import { Plus, Minus, Trash2 } from "lucide-react";

const CartItem = ({ item, onRemove, onUpdate }) => {
  return (
    <div className={styles.card}>
      <div className={styles.left}>
        <img
          src={`http://localhost:5000/uploads/products/${item.image}`}
          alt={item.name}
          className={styles.image}
        />

        <div className={styles.details}>
          <h3 className={styles.name}>{item.name}</h3>
          <p className={styles.description}>{item.description}</p>
          <p className={styles.price}>₹{item.price}</p>
        </div>
      </div>

      <div className={styles.right}>
        <div className={styles.quantityControl}>
          <button
            onClick={() => item.quantity > 1 && onUpdate(item._id, item.quantity - 1)}
            className={styles.qtyBtn}
          >
            <Minus size={16} />
          </button>
          <span>{item.quantity}</span>
          <button
            onClick={() => onUpdate(item._id, item.quantity + 1)}
            className={styles.qtyBtn}
          >
            <Plus size={16} />
          </button>
        </div>

        <button onClick={() => onRemove(item._id)} className={styles.removeBtn}>
          <Trash2 size={18} />
        </button>
      </div>
    </div>
  );
};

export default CartItem;

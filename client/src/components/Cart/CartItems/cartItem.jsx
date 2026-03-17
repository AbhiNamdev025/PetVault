import React from "react";
import styles from "./cartItem.module.css";
import { Plus, Minus, Trash2 } from "lucide-react";
import { BASE_URL } from "../../../utils/constants";
import { Button, QuantitySelector } from "../../common";
const CartItem = ({ item, onRemove, onUpdate }) => {
  return (
    <div className={styles.card}>
      <div className={styles.left}>
        <img
          src={`${BASE_URL}/uploads/products/${item.image}`}
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
        <QuantitySelector
          quantity={item.quantity}
          onIncrease={() => onUpdate(item._id, item.quantity + 1)}
          onDecrease={() =>
            item.quantity > 1 && onUpdate(item._id, item.quantity - 1)
          }
          className={styles.cartQuantitySelector}
        />
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onRemove(item._id)}
          aria-label="Remove item"
        >
          <Trash2 size={18} />
        </Button>
      </div>
    </div>
  );
};
export default CartItem;

import React from "react";
import { useNavigate } from "react-router-dom";
import { ShoppingBag } from "lucide-react";
import styles from "./EmptyCart.module.css";

const EmptyCart = () => {
  const navigate = useNavigate();

  return (
    <div className={styles.emptyCart}>
      <div className={styles.iconWrapper}>
        <ShoppingBag className={styles.icon} size={80} />
      </div>
      <h2 className={styles.title}>Your cart is empty!</h2>
      <p className={styles.text}>Looks like you haven’t added anything yet.</p>
      <button
        className={styles.shopBtn}
        onClick={() => navigate("/pet-products")}
      >
        Continue Shopping
      </button>
    </div>
  );
};

export default EmptyCart;

import React from "react";
import { useNavigate } from "react-router-dom";
import { ShoppingBag } from "lucide-react";
import styles from "./emptyCart.module.css";
import { Button, EmptyState } from "../../common";

const EmptyCart = () => {
  const navigate = useNavigate();

  return (
    <EmptyState
      className={styles.emptyCart}
      icon={
        <div className={styles.iconWrapper}>
          <ShoppingBag className={styles.icon} size={80} />
        </div>
      }
      title="Your cart is empty!"
      description="Looks like you haven’t added anything yet."
      action={
        <Button
          variant="primary"
          size="lg"
          onClick={() => navigate("/pet-products")}
        >
          Continue Shopping
        </Button>
      }
    />
  );
};

export default EmptyCart;

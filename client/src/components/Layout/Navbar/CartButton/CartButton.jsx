import React from "react";
import { useNavigate } from "react-router-dom";
import { ShoppingCart } from "lucide-react";
import { Button } from "../../../common";
import styles from "./CartButton.module.css";
import { useCart } from "../../../../Context/CartContext";

const CartButton = () => {
  const navigate = useNavigate();
  const { cartCount } = useCart();

  return (
    <Button
      className={styles.cartBtn}
      onClick={() => navigate("/cart")}
      variant="primary"
      size="md"
    >
      <ShoppingCart size={18} />
      {cartCount > 0 && <span className={styles.cartCount}>{cartCount}</span>}
    </Button>
  );
};

export default CartButton;

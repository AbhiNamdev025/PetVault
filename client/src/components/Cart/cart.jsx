import React, { useEffect, useState } from "react";
import { useCart } from "../../Context/CartContext";
import { removeCartItem, updateCartItem, clearCart } from "./cartServices";
import CartItem from "./CartItems/cartItem";
import EmptyCart from "./EmptyCart/emptyCart";
import styles from "./cart.module.css";
import { useNavigate } from "react-router-dom";
import { CartSkeleton } from "../Skeletons";
import { Button, SectionHeader } from "../common";
import {
  calculateTotalsForItems,
  fetchPlatformFeeConfig,
} from "../../utils/platformFee";

const Cart = () => {
  const { cartItems, loading, refreshCart } = useCart();
  const [platformConfig, setPlatformConfig] = useState(null);
  const token =
    localStorage.getItem("token") || sessionStorage.getItem("token");
  const navigate = useNavigate();

  // fetchCart is handled by context now, removing local implementation

  const handleRemove = async (id) => {
    await removeCartItem(id, token);
    refreshCart();
  };

  const handleUpdate = async (id, quantity) => {
    if (quantity < 1) return;
    await updateCartItem(id, quantity, token);
    refreshCart();
  };

  const handleClear = async () => {
    await clearCart(token);
    refreshCart();
  };

  const handleProceed = () => {
    navigate("/checkout");
  };

  useEffect(() => {
    refreshCart();
    fetchPlatformFeeConfig()
      .then((config) => setPlatformConfig(config))
      .catch(() => null);
  }, []);

  if (loading) return <CartSkeleton />;

  if (cartItems.length === 0) return <EmptyCart />;

  const { subtotal, platformFee, total } = calculateTotalsForItems(
    cartItems,
    platformConfig,
  );

  return (
    <section className={styles.cartSection}>
      <SectionHeader
        className={styles.header}
        align="center"
        level="page"
        title="Your Shopping Cart"
        subtitle={`${cartItems.length} item${cartItems.length > 1 ? "s" : ""} ready for checkout`}
      />

      <div className={styles.cartContainer}>
        <div className={styles.itemsContainer}>
          {cartItems.map((item) => (
            <CartItem
              key={item._id}
              item={item}
              onRemove={handleRemove}
              onUpdate={handleUpdate}
            />
          ))}
        </div>

        <div className={styles.summary}>
          <div className={styles.summaryBox}>
            <h2 className={styles.summaryTitle}>Order Summary</h2>

            <div className={styles.summaryRow}>
              <span>Subtotal</span>
              <span>₹{subtotal.toFixed(2)}</span>
            </div>

            <div className={styles.summaryRow}>
              <span>Shipping</span>
              <span className={styles.free}>Free</span>
            </div>
            <div className={styles.summaryRow}>
              <span>Platform Fee</span>
              <span>₹{platformFee.toFixed(2)}</span>
            </div>
            <div className={styles.summaryTotal}>
              <span>Total (Incl. Fee)</span>
              <span>₹{total.toFixed(2)}</span>
            </div>

            <div className={styles.summaryActions}>
              <Button
                variant="primary"
                size="lg"
                onClick={handleProceed}
                fullWidth
              >
                Proceed to Checkout
              </Button>

              <Button
                variant="outline"
                size="lg"
                onClick={() => navigate("/pet-products")}
                fullWidth
              >
                Continue Shopping
              </Button>

              <Button variant="ghost" size="lg" onClick={handleClear} fullWidth>
                Clear Cart
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Cart;

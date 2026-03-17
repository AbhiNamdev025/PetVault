import React, { useEffect, useState } from "react";
import { Minus, Plus, ShoppingCart, Store } from "lucide-react";
import { BASE_URL } from "../../../utils/constants";
import { useNavigate } from "react-router-dom";
import { Badge, Button, CatalogCard, QuantitySelector } from "../../common";
import styles from "./productCard.module.css";
import { useCart } from "../../../Context/CartContext";
import { updateCartItem } from "../../Cart/cartServices";
import toast from "react-hot-toast";

const ProductCard = ({ product, onView, onAddToCart }) => {
  const navigate = useNavigate();
  const { cartItems, refreshCart } = useCart();
  const [showQuantitySelector, setShowQuantitySelector] = useState(false);
  const [selectedQuantity, setSelectedQuantity] = useState(1);
  const [addingToCart, setAddingToCart] = useState(false);

  // Check if item is already in cart
  const cartItem = cartItems.find((item) => {
    const pId = item.productId?._id || item.productId;
    return pId === product._id;
  });

  const stockCount = Number(product.stock) || 0;
  const maxSelectableQuantity = Math.max(1, stockCount);

  useEffect(() => {
    if (cartItem) {
      setSelectedQuantity(cartItem.quantity);
    } else {
      setSelectedQuantity(1);
    }
    setAddingToCart(false);
  }, [cartItem?.quantity]);

  useEffect(() => {
    setShowQuantitySelector(false);
  }, [product._id]);

  const handleShopClick = (e) => {
    e.stopPropagation();
    if (product.shopId && product.shopId._id) {
      navigate(`/shop/${product.shopId._id}`);
    }
  };

  const openQuantitySelector = (e) => {
    e.stopPropagation();
    if (stockCount === 0) return;
    setShowQuantitySelector(true);
  };

  const syncCartUpdate = async (newQty) => {
    if (!cartItem) return;
    const token =
      localStorage.getItem("token") || sessionStorage.getItem("token");
    if (!token) return;

    try {
      setAddingToCart(true);
      await updateCartItem(cartItem._id, newQty, token);
      await refreshCart();
    } catch (err) {
      toast.error("Failed to update cart");
    } finally {
      setAddingToCart(false);
    }
  };

  const handleIncrease = async () => {
    const newQty = Math.min(maxSelectableQuantity, selectedQuantity + 1);
    setSelectedQuantity(newQty);
    if (cartItem) {
      await syncCartUpdate(newQty);
    }
  };

  const handleDecrease = async () => {
    const newQty = Math.max(1, selectedQuantity - 1);
    setSelectedQuantity(newQty);
    if (cartItem) {
      await syncCartUpdate(newQty);
    }
  };

  const handleAddToCart = async (e) => {
    e.stopPropagation();
    if (stockCount === 0 || !onAddToCart) return;
    try {
      setAddingToCart(true);
      const result = await onAddToCart(
        product,
        cartItem ? 1 : selectedQuantity,
      );
      if (result !== false) {
        await refreshCart();
        setShowQuantitySelector(true);
      } else {
        setAddingToCart(false); // Only reset if failed
      }
    } catch (err) {
      setAddingToCart(false);
    }
  };

  return (
    <CatalogCard
      onClick={() => onView(product._id)}
      imageSrc={
        product.images?.length > 0
          ? `${BASE_URL}/uploads/products/${product.images[0]}`
          : ""
      }
      imageAlt={product.name}
      topBadges={
        product.stock === 0
          ? [
              {
                position: "top-left",
                content: (
                  <Badge variant="error" size="sm">
                    Out of Stock
                  </Badge>
                ),
              },
            ]
          : []
      }
      title={product.name}
      subtitle={product.brand || "Generic"}
      ownerLabel={
        product.shopId
          ? product.shopId.businessName || product.shopId.name || "Pet Vault"
          : "Pet Vault"
      }
      ownerIcon={<Store size={13} />}
      onOwnerClick={product.shopId ? handleShopClick : undefined}
      priceLabel={`₹${product.price}`}
      rating={product.rating}
      metaItems={[]}
      actionContent={
        !showQuantitySelector ? (
          <Button
            fullWidth
            size="sm"
            leftIcon={<ShoppingCart size={14} />}
            onClick={handleAddToCart}
            disabled={stockCount === 0}
            isLoading={addingToCart}
          >
            {stockCount === 0 ? "Out of Stock" : "Add to Cart"}
          </Button>
        ) : (
          <div className={styles.inlineQuantityAction}>
            <QuantitySelector
              quantity={selectedQuantity}
              onIncrease={handleIncrease}
              onDecrease={handleDecrease}
              loading={addingToCart}
              max={maxSelectableQuantity}
              className={styles.compactSelector}
            />
            {cartItem && !addingToCart && (
              <Button
                variant="primary"
                size="sm"
                onClick={() => navigate("/cart")}
                className={styles.sideAddBtn}
              >
                Go to Cart
              </Button>
            )}
          </div>
        )
      }
    />
  );
};

export default ProductCard;

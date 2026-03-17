import React, { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { Plus, Minus, Star, CheckCircle } from "lucide-react";
import toast from "react-hot-toast";
import { API_BASE_URL, BASE_URL } from "../../../utils/constants";
import styles from "./productDetails.module.css";
import { DetailsSkeleton } from "../../Skeletons";
import { openAuthModal } from "../../../utils/authModalNavigation";
import {
  Button,
  DetailBackButton,
  DetailEntityCard,
  DetailMediaGallery,
  DetailPage,
  DetailSplitCard,
  ReviewSection,
  QuantitySelector,
} from "../../common";
import { useCart } from "../../../Context/CartContext";
import { updateCartItem } from "../../Cart/cartServices";

const ProductDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { cartItems, refreshCart } = useCart();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [aboutOpen, setAboutOpen] = useState(false);
  const [infoOpen, setInfoOpen] = useState(true);
  const [addingToCart, setAddingToCart] = useState(false);
  const [showQuantitySelector, setShowQuantitySelector] = useState(false);
  const [selectedQuantity, setSelectedQuantity] = useState(1);
  const [formRating, setFormRating] = useState(0);
  const [formReview, setFormReview] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const location = useLocation();

  const cartItem = cartItems.find((item) => {
    const pId = item.productId?._id || item.productId;
    return pId === id;
  });

  const fetchProductDetails = () => {
    setLoading(true);
    fetch(`${API_BASE_URL}/products/${id}?populate=shopId`)
      .then((res) => res.json())
      .then((data) => {
        setProduct(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    fetchProductDetails();
  }, [id]);

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
  }, [id]);

  if (loading) return <DetailsSkeleton />;
  if (!product) return null;

  const stockCount = Number(product.stock) || 0;
  const maxSelectableQuantity = Math.max(1, stockCount);

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

  const openQuantitySelector = () => {
    if (stockCount === 0) return toast.info("Out of stock");
    setShowQuantitySelector(true);
  };

  const handleAddToCart = async () => {
    if (stockCount === 0) return toast.info("Out of stock");
    const token =
      localStorage.getItem("token") || sessionStorage.getItem("token");
    if (!token) {
      openAuthModal(navigate, {
        location,
        view: "login",
        from: location.pathname,
      });
      return;
    }
    try {
      setAddingToCart(true);
      const res = await fetch(`${API_BASE_URL}/cart/add`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          productId: product._id,
          quantity: cartItem ? 1 : selectedQuantity,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        await refreshCart();
        setShowQuantitySelector(true);
        toast.success(
          `${selectedQuantity} item${selectedQuantity > 1 ? "s" : ""} added to cart`,
        );
      } else {
        toast.error(data.message || "Failed to add to cart");
        setAddingToCart(false);
      }
    } catch {
      setAddingToCart(false);
    }
  };
  const checkAuth = () =>
    !!(localStorage.getItem("token") || sessionStorage.getItem("token"));
  const submitReview = async () => {
    if (!checkAuth()) {
      openAuthModal(navigate, {
        location,
        view: "login",
        from: location.pathname,
      });
      return;
    }

    if (!formRating) return toast.warning("Select a rating");
    try {
      setSubmitting(true);
      const token =
        localStorage.getItem("token") || sessionStorage.getItem("token");
      const res = await fetch(`${API_BASE_URL}/products/${id}/rate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          rating: formRating,
          review: formReview,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        fetchProductDetails();
        setFormRating(0);
        setFormReview("");
        toast.success("Review submitted");
      } else toast.error(data.message);
    } catch {
      toast.error("Error submitting review");
    } finally {
      setSubmitting(false);
    }
  };
  const calculateAverageRating = (ratings) => {
    if (!ratings || ratings.length === 0) return 0;
    const total = ratings.reduce((s, r) => s + r.rating, 0);
    return (total / ratings.length).toFixed(1);
  };
  const averageRating = calculateAverageRating(product.ratings);
  const totalReviews = product.ratings?.length || 0;
  const productImages = (product.images || []).map(
    (img) => `${BASE_URL}/uploads/products/${img}`,
  );
  const fallbackImage =
    "https://t4.ftcdn.net/jpg/04/70/29/97/360_F_470299797_UD0eoVMMSUbHCcNJCdv2t8B2g1GVqYgs.jpg";
  return (
    <DetailPage>
      <DetailBackButton onClick={() => navigate(-1)} />

      <DetailSplitCard
        gallery={
          <DetailMediaGallery
            images={productImages}
            selectedIndex={selectedImage}
            onSelect={setSelectedImage}
            fallbackSrc={fallbackImage}
            alt={product.name}
            objectFit="contain"
          />
        }
        content={
          <div className={styles.info}>
            {/* HEADER */}
            <div className={styles.headerRow}>
              <div className={styles.typeRow}>
                <h1 className={styles.name}>{product.name}</h1>
                <p className={styles.type}>{product.brand}</p>
              </div>

              <div className={styles.priceBox}>
                <div className={styles.price}>₹{product.price}</div>
                <span className={styles.available}>
                  {product.stock > 0 ? "In Stock" : "Out of Stock"}
                </span>
              </div>
            </div>

            {/* TAGS */}
            <div className={styles.tags}>
              <span className={styles.tag}>
                <Star size={16} /> {averageRating > 0 ? averageRating : 0}/5 (
                {totalReviews})
              </span>
              <span className={styles.tag}>Brand: {product.brand}</span>
              <span className={styles.tag}>Stock: {product.stock}</span>
            </div>

            {/* ABOUT */}
            <div className={styles.accordion}>
              <Button
                className={`${styles.accordionHeader} ${aboutOpen ? styles.activeHeader : ""}`}
                onClick={() => setAboutOpen(!aboutOpen)}
                variant="ghost"
                size="md"
                usePresetStyle
              >
                {aboutOpen ? <Minus /> : <Plus />} About Product
              </Button>

              {aboutOpen && (
                <div className={styles.aboutList}>
                  {product.description || "No description available"}
                </div>
              )}
            </div>

            {/* PRODUCT INFO */}
            <div className={styles.accordion}>
              <Button
                className={`${styles.accordionHeader} ${infoOpen ? styles.activeHeader : ""}`}
                onClick={() => setInfoOpen(!infoOpen)}
                variant="ghost"
                size="md"
                usePresetStyle
              >
                {infoOpen ? <Minus /> : <Plus />} Product Information
              </Button>

              {infoOpen && (
                <div className={styles.petInfoBox}>
                  <div className={styles.infoRow}>
                    <CheckCircle /> Brand: {product.brand}
                  </div>
                  <div className={styles.infoRow}>
                    <CheckCircle /> Category: {product.category}
                  </div>
                </div>
              )}
            </div>

            {/* ACTION */}
            <div className={styles.actions}>
              {!showQuantitySelector ? (
                <Button
                  className={styles.actionButton}
                  disabled={addingToCart || stockCount === 0}
                  onClick={handleAddToCart}
                  variant="primary"
                  size="md"
                  fullWidth
                  usePresetStyle
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
                    className={styles.detailQuantitySelector}
                  />
                  {cartItem && !addingToCart && (
                    <Button
                      variant="primary"
                      size="md"
                      onClick={() => navigate("/cart")}
                      className={styles.sideAddBtn}
                    >
                      Go to Cart
                    </Button>
                  )}
                </div>
              )}
            </div>
          </div>
        }
      />

      {product.shopId && (
        <DetailEntityCard
          avatarSrc={
            product.shopId.avatar
              ? `${BASE_URL}/uploads/avatars/${product.shopId.avatar}`
              : "https://img.freepik.com/free-vector/shop-with-sign-open-design_23-2148544029.jpg"
          }
          avatarAlt={product.shopId.businessName || product.shopId.name}
          title={product.shopId.businessName || product.shopId.name}
          subtitle="Verified Seller"
          badges={["Ships within 24 hrs"]}
          ctaText="View Shop →"
          onClick={() => navigate(`/shop/${product.shopId._id}`)}
          avatarFit="contain"
        />
      )}

      <ReviewSection
        title="Customer Reviews"
        count={totalReviews}
        formTitle="Write a Review"
        formDescription="Share your experience with this product"
        ratingValue={formRating}
        onRatingChange={setFormRating}
        reviewValue={formReview}
        onReviewChange={setFormReview}
        placeholder="What did you think about the quality, delivery, or overall experience?"
        onSubmit={submitReview}
        submitting={submitting}
        submitText="Submit Review"
        submittingText="Submitting..."
        reviews={product.ratings || []}
        emptyText="No reviews yet. Be the first to review!"
        getAuthor={(r) => r.userId?.name || "Anonymous User"}
      />
    </DetailPage>
  );
};
export default ProductDetails;

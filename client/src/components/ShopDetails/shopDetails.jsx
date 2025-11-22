import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Star, MapPin, PawPrint } from "lucide-react";
import { API_BASE_URL } from "../../utils/constants";
import ProductCard from "../PetProducts/ProductCard/productCard";
import PetCard from "../PetShop/PetCard/petCard";
import styles from "./shopDetails.module.css";
import toast from "react-hot-toast";
const ShopDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [shop, setShop] = useState(null);
  const [products, setProducts] = useState([]);
  const [pets, setPets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formRating, setFormRating] = useState(0);
  const [formReview, setFormReview] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [showLoginPopup, setShowLoginPopup] = useState(false);
  const [activeTab, setActiveTab] = useState("products");

  useEffect(() => {
    if (id) fetchShopDetails();
  }, [id]);

  const fetchShopDetails = async () => {
    try {
      const [shopRes, productsRes, petsRes] = await Promise.all([
        fetch(`${API_BASE_URL}/shop/${id}`),
        fetch(`${API_BASE_URL}/products/shop/${id}`),
        fetch(`${API_BASE_URL}/pets/shop/${id}`),
      ]);

      const shopData = await shopRes.json();
      const productsData = productsRes.ok
        ? await productsRes.json()
        : { products: [] };
      const petsData = petsRes.ok ? await petsRes.json() : { pets: [] };

      setShop(shopData);
      setProducts(productsData.products || []);
      setPets(petsData.pets || []);
    } catch {
      toast.error("Failed to load shop details");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (shop && shop.roleData?.shopType?.toLowerCase() === "petstore") {
      setActiveTab("pets");
    }
  }, [shop]);

  const handleViewProduct = (productId) => navigate(`/products/${productId}`);
  const handleViewPet = (petId) => navigate(`/shop-pets/${petId}`);

  const handleAddToCart = async (product) => {
    const token =
      localStorage.getItem("token") || sessionStorage.getItem("token");
    if (!token) return toast.error("Please login to add items to cart");

    try {
      const res = await fetch(`${API_BASE_URL}/cart/add`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ productId: product._id, quantity: 1 }),
      });

      const data = await res.json();
      res.ok ? toast.success("Added to cart!") : toast.error(data.message);
    } catch {
      toast.error("Failed to add to cart");
    }
  };

  const handleEnquiry = (pet) => {
    const token =
      localStorage.getItem("token") || sessionStorage.getItem("token");
    if (!token) return toast.error("Please login to send enquiry");

    navigate(`/shop-pets/${pet._id}`);
  };

  const calculateAverageRating = (ratings) => {
    if (!ratings || ratings.length === 0) return 0;
    const total = ratings.reduce((s, r) => s + r.rating, 0);
    return (total / ratings.length).toFixed(1);
  };

  const checkAuth = () =>
    !!(localStorage.getItem("token") || sessionStorage.getItem("token"));

  const submitReview = async () => {
    if (!checkAuth()) return setShowLoginPopup(true);
    if (!formRating) return toast.warning("Select a rating");

    try {
      setSubmitting(true);
      const token =
        localStorage.getItem("token") || sessionStorage.getItem("token");

      const res = await fetch(`${API_BASE_URL}/shop/${id}/rate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ rating: formRating, review: formReview }),
      });

      const data = await res.json();
      if (res.ok) {
        const refreshed = await fetch(`${API_BASE_URL}/shop/${id}`);
        if (refreshed.ok) setShop(await refreshed.json());
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

  const handleLogin = () => {
    setShowLoginPopup(false);
    navigate("/login", { state: { from: `/shop/${id}` } });
  };

  if (loading) return <div className={styles.loading}>Loading shop...</div>;
  if (!shop) return <div className={styles.notFound}>Shop not found</div>;

  const type = shop?.roleData?.shopType?.toLowerCase();
  const isPetStore = type === "petstore";
  const isMixed = type === "mixed";

  const showProducts = type === "products" || isMixed;
  const showPets = isPetStore || isMixed;

  const averageRating = calculateAverageRating(shop.ratings);
  const totalReviews = shop.ratings?.length || 0;

  return (
    <div className={styles.shopDetails}>
      <button className={styles.backBtn} onClick={() => navigate(-1)}>
        <ArrowLeft size={20} /> Back
      </button>

      {/* Header */}
      <div className={styles.shopHeader}>
        <div className={styles.shopInfo}>
          <h1 className={styles.shopName}>{shop.businessName || shop.name}</h1>
          <p className={styles.shopType}>{shop.roleData?.shopType}</p>

          <div className={styles.location}>
            <MapPin size={16} />
            <span>
              {shop.address?.street} {shop.address?.city}
            </span>
          </div>

          <div className={styles.ratingRow}>
            <Star size={18} className={styles.starIcon} />
            <span>{averageRating > 0 ? averageRating : "No ratings yet"}</span>
            <span className={styles.reviewCount}>({totalReviews} reviews)</span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      {showProducts && showPets && (
        <div className={styles.tabNavigation}>
          <button
            className={`${styles.tab} ${
              activeTab === "products" ? styles.activeTab : ""
            }`}
            onClick={() => setActiveTab("products")}
          >
            Products ({products.length})
          </button>
          <button
            className={`${styles.tab} ${
              activeTab === "pets" ? styles.activeTab : ""
            }`}
            onClick={() => setActiveTab("pets")}
          >
            <PawPrint size={16} /> Pets ({pets.length})
          </button>
        </div>
      )}

      {/* Products */}
      {showProducts && activeTab === "products" && (
        <div className={styles.productsSection}>
          <h2 className={styles.sectionTitle}>Products</h2>

          {products.length === 0 ? (
            <div className={styles.noProducts}>No products available.</div>
          ) : (
            <div className={styles.productsGrid}>
              {products.map((product) => (
                <ProductCard
                  key={product._id}
                  product={product}
                  onView={handleViewProduct}
                  onAddToCart={handleAddToCart}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Pets */}
      {showPets && activeTab === "pets" && (
        <div className={styles.petsSection}>
          <h2 className={styles.sectionTitle}>
            <PawPrint size={20} /> Available Pets ({pets.length})
          </h2>

          {pets.length === 0 ? (
            <div className={styles.noPets}>No pets available.</div>
          ) : (
            <div className={styles.petsGrid}>
              {pets.map((pet) => (
                <PetCard
                  key={pet._id}
                  pet={pet}
                  onView={handleViewPet}
                  onEnquiry={handleEnquiry}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Reviews */}
      <div className={styles.reviewsSection}>
        <h2 className={styles.sectionTitle}>Customer Reviews</h2>

        {/* Submit review */}
        <div className={styles.reviewFormBox}>
          <h3>Write a Review</h3>

          <div className={styles.starRow}>
            {[1, 2, 3, 4, 5].map((s) => (
              <Star
                key={s}
                size={28}
                className={
                  formRating >= s ? styles.starActive : styles.starInactive
                }
                onClick={() => setFormRating(s)}
              />
            ))}
          </div>

          <textarea
            value={formReview}
            onChange={(e) => setFormReview(e.target.value)}
            className={styles.reviewTextarea}
            placeholder="Share your experience..."
          />

          <button
            className={styles.submitReviewButton}
            onClick={submitReview}
            disabled={submitting}
          >
            {submitting ? "Submitting..." : "Submit Review"}
          </button>
        </div>

        {/* Review List */}
        <div className={styles.reviewsGrid}>
          {!shop.ratings?.length ? (
            <div className={styles.noReviews}>No reviews yet.</div>
          ) : (
            shop.ratings.map((r) => (
              <div key={r._id} className={styles.reviewCard}>
                <div className={styles.reviewHeader}>
                  <strong>{r.userId?.name || "Anonymous"}</strong>
                  <span className={styles.reviewDate}>
                    {new Date(r.createdAt).toLocaleDateString()}
                  </span>
                </div>

                <div className={styles.ratingRow}>
                  <Star size={16} className={styles.starIcon} />
                  <span>{r.rating}</span>
                </div>

                <p className={styles.reviewText}>{r.review}</p>
              </div>
            ))
          )}
        </div>
      </div>

      {/* LOGIN POPUP */}
      {showLoginPopup && (
        <div className={styles.loginPopupOverlay}>
          <div className={styles.loginPopup}>
            <h3>Login Required</h3>
            <p>Please login to submit a review</p>

            <div className={styles.popupActions}>
              <button className={styles.loginButton} onClick={handleLogin}>
                Login
              </button>
              <button
                className={styles.cancelButton}
                onClick={() => setShowLoginPopup(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ShopDetails;

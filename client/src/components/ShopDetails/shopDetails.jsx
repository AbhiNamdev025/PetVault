import React, { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import {
  ArrowLeft,
  Star,
  MapPin,
  PawPrint,
  Phone,
  MessageCircle,
  UserRoundCheck,
} from "lucide-react";
import { API_BASE_URL, BASE_URL } from "../../utils/constants";
import ProductCard from "../PetProducts/ProductCard/productCard";
import PetCard from "../PetShop/PetCard/petCard";
import styles from "./shopDetails.module.css";
import toast from "react-hot-toast";
import { DetailsSkeleton } from "../Skeletons";
import { openAuthModal } from "../../utils/authModalNavigation";
import { Button, Pagination, ReviewSection, SectionHeader } from "../common";

const ShopDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [shop, setShop] = useState(null);
  const [products, setProducts] = useState([]);
  const [pets, setPets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formRating, setFormRating] = useState(0);
  const [formReview, setFormReview] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState("products");
  const [itemsPerPage, setItemsPerPage] = useState(3);
  const [productsPage, setProductsPage] = useState(1);
  const [petsPage, setPetsPage] = useState(1);
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
        : {
            products: [],
          };
      const petsData = petsRes.ok
        ? await petsRes.json()
        : {
            pets: [],
          };
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

  useEffect(() => {
    const mediaQuery = window.matchMedia("(max-width: 768px)");
    const syncItemsPerPage = () => setItemsPerPage(mediaQuery.matches ? 1 : 3);
    syncItemsPerPage();
    if (typeof mediaQuery.addEventListener === "function") {
      mediaQuery.addEventListener("change", syncItemsPerPage);
      return () => mediaQuery.removeEventListener("change", syncItemsPerPage);
    }
    mediaQuery.addListener(syncItemsPerPage);
    return () => mediaQuery.removeListener(syncItemsPerPage);
  }, []);

  const totalProductPages = Math.max(
    1,
    Math.ceil(products.length / itemsPerPage),
  );
  const totalPetPages = Math.max(1, Math.ceil(pets.length / itemsPerPage));
  useEffect(() => {
    setProductsPage((prev) => Math.min(prev, totalProductPages));
  }, [totalProductPages]);
  useEffect(() => {
    setPetsPage((prev) => Math.min(prev, totalPetPages));
  }, [totalPetPages]);
  const visibleProducts = products.slice(
    (productsPage - 1) * itemsPerPage,
    productsPage * itemsPerPage,
  );
  const visiblePets = pets.slice(
    (petsPage - 1) * itemsPerPage,
    petsPage * itemsPerPage,
  );
  const handleViewProduct = (productId) => navigate(`/products/${productId}`);
  const handleViewPet = (petId) => navigate(`/shop-pets/${petId}`);
  const handleAddToCart = async (product, quantity = 1) => {
    const stockCount = Number(product.stock) || 0;
    if (stockCount === 0) {
      toast.info("Out of stock");
      return false;
    }
    const quantityToAdd = Math.min(
      Math.max(Number(quantity) || 1, 1),
      Math.max(1, stockCount),
    );
    const token =
      localStorage.getItem("token") || sessionStorage.getItem("token");
    if (!token) {
      openAuthModal(navigate, {
        location,
        view: "login",
        from: location.pathname,
      });
      return false;
    }
    try {
      const res = await fetch(`${API_BASE_URL}/cart/add`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          productId: product._id,
          quantity: quantityToAdd,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        window.dispatchEvent(new Event("cart-updated"));
        toast.success(
          `${quantityToAdd} item${quantityToAdd > 1 ? "s" : ""} added to cart`,
        );
        navigate("/cart");
        return true;
      }
      toast.error(data.message || "Failed to add to cart");
      return false;
    } catch {
      toast.error("Failed to add to cart");
      return false;
    }
  };
  const handleEnquiry = (pet) => {
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
      const res = await fetch(`${API_BASE_URL}/shop/${id}/rate`, {
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
  if (loading) return <DetailsSkeleton />;
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
      <Button
        className={styles.backBtn}
        onClick={() => navigate(-1)}
        variant="ghost"
        size="sm"
      >
        <ArrowLeft size={20} /> Back
      </Button>

      {/* Header */}
      <div className={styles.shopHeader}>
        <img
          src={
            shop.avatar
              ? `${BASE_URL}/uploads/avatars/${shop.avatar}`
              : "https://media.istockphoto.com/id/1155986877/vector/pets-shop-vector-logo.jpg?s=612x612&w=0&k=20&c=i3Q5ZELG3sY6Fj-5A7Q8k8S3g4M7yL3r7z4V6XU5vK0="
          }
          alt={shop.businessName}
          className={styles.shopAvatar}
        />
        <div className={styles.shopInfo}>
          <div className={styles.headerTop}>
            <h1 className={styles.shopName}>
              {shop.roleData?.shopName || shop.businessName || shop.name}
            </h1>
            <div className={styles.ratingBadge}>
              <Star
                size={16}
                fill="var(--color-warning)"
                stroke="var(--color-warning)"
              />
              <span>{averageRating > 0 ? averageRating : "New"}</span>
              <span className={styles.reviewCount}>
                ({totalReviews} reviews)
              </span>
            </div>
          </div>

          <p className={styles.shopType}>{shop.roleData?.shopType || "Shop"}</p>

          <div className={styles.detailsRow}>
            <div className={styles.detailItem}>
              <MapPin size={16} />
              <span>
                {shop.address?.street}, {shop.address?.city}
              </span>
            </div>

            {shop.roleData?.ownerName && (
              <div className={styles.detailItem}>
                <UserRoundCheck size={16} />
                <span>Owner: {shop.roleData.ownerName}</span>
              </div>
            )}
          </div>

          {shop.phone && (
            <div className={styles.actionButtons}>
              <Button
                as="a"
                href={`tel:${shop.phone}`}
                className={styles.callButton}
                variant="outline"
                size="md"
              >
                <Phone size={20} /> <span>Call</span>
              </Button>
              <Button
                as="a"
                href={`https://wa.me/${shop.phone}`}
                target="_blank"
                className={styles.whatsappButton}
                variant="success"
                size="md"
              >
                <MessageCircle size={20} /> <span>WhatsApp</span>
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Tabs */}
      {(showProducts || showPets) && (
        <div className={styles.tabNavigation}>
          {showProducts && (
            <Button
              className={`${styles.tab} ${activeTab === "products" ? styles.activeTab : ""}`}
              as="a"
              href="#products-section"
              onClick={() => setActiveTab("products")}
              variant="ghost"
              size="sm"
            >
              Products ({products.length})
            </Button>
          )}
          {showPets && (
            <Button
              className={`${styles.tab} ${activeTab === "pets" ? styles.activeTab : ""}`}
              as="a"
              href="#pets-section"
              onClick={() => setActiveTab("pets")}
              variant="ghost"
              size="sm"
            >
              <PawPrint size={16} /> Pets ({pets.length})
            </Button>
          )}
          <Button
            className={styles.tab}
            as="a"
            href="#reviews-section"
            variant="ghost"
            size="sm"
          >
            Reviews
          </Button>
        </div>
      )}

      {/* Products */}
      {showProducts && activeTab === "products" && (
        <div id="products-section" className={styles.productsSection}>
          <SectionHeader
            className={styles.sectionHeader}
            title="Products"
            count={products.length}
            level="section"
          />

          {products.length === 0 ? (
            <div className={styles.noProducts}>No products available.</div>
          ) : (
            <div className={styles.productsGrid}>
              {visibleProducts.map((product) => (
                <ProductCard
                  key={product._id}
                  product={product}
                  onView={handleViewProduct}
                  onAddToCart={handleAddToCart}
                />
              ))}
            </div>
          )}
          {products.length > 0 && (
            <Pagination
              currentPage={productsPage}
              totalPages={totalProductPages}
              hideIfSinglePage={false}
              onPageChange={setProductsPage}
            />
          )}
        </div>
      )}

      {/* Pets */}
      {showPets && activeTab === "pets" && (
        <div id="pets-section" className={styles.petsSection}>
          <SectionHeader
            className={styles.sectionHeader}
            icon={<PawPrint size={20} />}
            title="Available Pets"
            count={pets.length}
            level="section"
          />

          {pets.length === 0 ? (
            <div className={styles.noPets}>No pets available.</div>
          ) : (
            <div className={styles.petsGrid}>
              {visiblePets.map((pet) => (
                <PetCard
                  key={pet._id}
                  pet={pet}
                  onView={handleViewPet}
                  onEnquiry={handleEnquiry}
                />
              ))}
            </div>
          )}
          {pets.length > 0 && (
            <Pagination
              currentPage={petsPage}
              totalPages={totalPetPages}
              hideIfSinglePage={false}
              onPageChange={setPetsPage}
            />
          )}
        </div>
      )}

      <div id="reviews-section" className={styles.sectionAnchor}>
        <ReviewSection
          title="Customer Reviews"
          count={totalReviews}
          formTitle="Write a Review"
          ratingValue={formRating}
          onRatingChange={setFormRating}
          reviewValue={formReview}
          onReviewChange={setFormReview}
          placeholder="Share your experience..."
          onSubmit={submitReview}
          submitting={submitting}
          submitText="Submit Review"
          submittingText="Submitting..."
          reviews={shop.ratings || []}
          emptyText="No reviews yet."
        />
      </div>
    </div>
  );
};
export default ShopDetails;

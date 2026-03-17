import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import toast from "react-hot-toast";
import ProductGrid from "./ProductGrid/productGrid";
import { API_BASE_URL } from "../../utils/constants";
import styles from "./products.module.css";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/autoplay";
import { Autoplay, Pagination, EffectFade } from "swiper/modules";
import "swiper/css/pagination";
import "swiper/css/effect-fade";
import { Store } from "lucide-react";
import { SearchFilterBar, SectionHeader } from "../common";
import FilterSidebar from "../common/FilterSidebar/FilterSidebar";
import { openAuthModal } from "../../utils/authModalNavigation";

const Products = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    search: "",
    category: "all",
    sort: "newest",
  });
  const [showFilters, setShowFilters] = useState(false);

  const carouselImages = [
    "https://supertails.com/cdn/shop/files/joint_care_b32a151f-e2dd-487c-8429-abf99b04a677_1200x.webp?v=1762764821",
    "/images/products/img3.png",
    "https://supertails.com/cdn/shop/files/online_store_web_dcb01f7b-c69c-499f-b2c2-eb09fc8b3542_1200x.webp?v=1762793524",
    "/images/products/img1.png",
    "/images/products/img5.png",
    "https://supertails.com/cdn/shop/files/supplements_vitamins_934243e7-b553-4065-97df-0e5378d58c48_1200x.webp?v=1762764821",
    "https://supertails.com/cdn/shop/files/bowls_7a9810c1-58ba-4195-a916-bef17dc536af_1200x.webp?v=1762764821",
  ];

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    filterProducts();
  }, [products, filters]);

  const fetchProducts = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/products?populate=shopId`);
      const data = await response.json();
      setProducts(data.products || []);
    } catch {
      toast.error("Failed to load products");
    } finally {
      setLoading(false);
    }
  };

  const filterProducts = () => {
    let filtered = products.filter((product) => {
      const q = filters.search.trim().toLowerCase();
      const shopName =
        product.shopId?.businessName || product.shopId?.name || "";
      const matchesSearch =
        !q ||
        [
          product.name,
          product.brand,
          product.category,
          product.description,
          Array.isArray(product.features)
            ? product.features.join(" ")
            : product.features,
          product.type,
          product.petType,
          product.forPetType,
          shopName,
          product.shopId ? "shop" : "",
        ].some((value) =>
          String(value || "")
            .toLowerCase()
            .includes(q),
        );
      const matchesCategory =
        filters.category === "all" || product.category === filters.category;
      return matchesSearch && matchesCategory;
    });

    switch (filters.sort) {
      case "price_low_high":
        filtered.sort((a, b) => a.price - b.price);
        break;
      case "price_high_low":
        filtered.sort((a, b) => b.price - a.price);
        break;
      case "rating_high":
        filtered.sort((a, b) => b.rating - a.rating);
        break;
      default:
        filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }
    setFilteredProducts(filtered);
  };

  const handleViewProduct = (id) => {
    navigate(`/products/${id}`);
  };

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

      if (res.ok) {
        window.dispatchEvent(new Event("cart-updated"));
        toast.success(
          `${quantityToAdd} item${quantityToAdd > 1 ? "s" : ""} added to cart`,
        );
        return true;
      } else {
        const errData = await res.json();
        toast.error(errData.message || "Failed to add to cart");
        return false;
      }
    } catch {
      toast.error("Something went wrong");
      return false;
    }
  };

  const filterOptions = [
    {
      id: "category",
      label: "Category",
      values: [
        { id: "all", label: "All Products" },
        { id: "food", label: "Food" },
        { id: "toy", label: "Toys" },
        { id: "accessory", label: "Accessories" },
        { id: "grooming", label: "Grooming" },
        { id: "health", label: "Health" },
        { id: "bedding", label: "Bedding" },
      ],
    },
    {
      id: "sort",
      label: "Sort By",
      clearValue: "newest",
      values: [
        { id: "newest", label: "Newest" },
        { id: "price_low_high", label: "Price: Low → High" },
        { id: "price_high_low", label: "Price: High → Low" },
        { id: "rating_high", label: "Top Rated" },
      ],
    },
  ];

  const hasActiveFilters =
    filters.search.trim() !== "" ||
    filters.category !== "all" ||
    filters.sort !== "newest";

  return (
    <div className={styles.productsPage}>
      <FilterSidebar
        isOpen={showFilters}
        onClose={() => setShowFilters(false)}
        filters={filters}
        setFilters={setFilters}
        options={filterOptions}
        showSearch={false}
        onReset={() =>
          setFilters({ search: "", category: "all", sort: "newest" })
        }
      />
      <div className={styles.hero}>
        <div className={styles.carouselSection}>
          <Swiper
            modules={[Autoplay]}
            autoplay={{ delay: 1500, disableOnInteraction: false }}
            loop={true}
            speed={1000}
            slidesPerView={1}
            spaceBetween={0}
          >
            {carouselImages.map((img, i) => (
              <SwiperSlide key={i}>
                <img
                  src={img}
                  alt={`banner-${i}`}
                  className={styles.carouselImage}
                />
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      </div>

      <div className={styles.container}>
        <SectionHeader
          className={styles.resultsInfo}
          title="All Products"
          subtitle="Find products quickly with search, category, and sort."
          level="section"
          align="center"
          icon={<Store />}
          actions={
            <SearchFilterBar
              searchPlaceholder="Search by name, brand, type, or shop..."
              searchValue={filters.search}
              onSearchChange={(value) =>
                setFilters((prev) => ({ ...prev, search: value }))
              }
              resultText={`${filteredProducts.length} items found`}
              showFilterButton
              onFilterClick={() => setShowFilters(true)}
              hasActiveFilters={hasActiveFilters}
              onClear={() =>
                setFilters({
                  search: "",
                  category: "all",
                  sort: "newest",
                })
              }
            />
          }
        />

        <ProductGrid
          products={filteredProducts}
          onViewProduct={handleViewProduct}
          onAddToCart={handleAddToCart}
          loading={loading}
        />
      </div>
    </div>
  );
};

export default Products;

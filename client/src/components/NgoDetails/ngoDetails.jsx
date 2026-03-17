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
import styles from "./ngoDetails.module.css";
import toast from "react-hot-toast";
import AdoptionPetCard from "../PetAdoption/AdoptionPetCard/adoptionPetCard";
import { DetailsSkeleton } from "../Skeletons";
import { openAuthModal } from "../../utils/authModalNavigation";
import { Button, Pagination, ReviewSection, SectionHeader } from "../common";

const NgoDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [ngo, setNgo] = useState(null);
  const [pets, setPets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formRating, setFormRating] = useState(0);
  const [formReview, setFormReview] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [itemsPerPage, setItemsPerPage] = useState(3);
  const [currentPage, setCurrentPage] = useState(1);
  useEffect(() => {
    if (id) fetchNgoDetails();
  }, [id]);

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

  const totalPetPages = Math.max(1, Math.ceil(pets.length / itemsPerPage));
  useEffect(() => {
    setCurrentPage((prev) => Math.min(prev, totalPetPages));
  }, [totalPetPages]);
  const visiblePets = pets.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );
  const fetchNgoDetails = async () => {
    try {
      const [ngoRes, petsRes] = await Promise.all([
        fetch(`${API_BASE_URL}/ngo/${id}`),
        fetch(`${API_BASE_URL}/pets/ngo/${id}`),
      ]);
      const ngoData = await ngoRes.json();
      const petsData = petsRes.ok
        ? await petsRes.json()
        : {
            pets: [],
          };
      setNgo(ngoData);
      setPets(petsData.pets || []);
    } catch {
      toast.error("Failed to load NGO details");
    } finally {
      setLoading(false);
    }
  };
  const handleViewPet = (petId) => {
    navigate(`/adopt-pets/${petId}`);
  };
  const handleAdoptionEnquiry = (pet) => {
    const token =
      localStorage.getItem("token") || sessionStorage.getItem("token");
    if (!token) {
      toast.error("Please login to send enquiry");
      return;
    }
    navigate(`/adopt-pets/${pet._id}`);
  };
  const formatAddress = (address) => {
    if (!address) return "Address not available";
    if (typeof address === "string") return address;
    const { street, city, state, zipCode } = address;
    return [street, city, state, zipCode].filter(Boolean).join(", ");
  };
  const calculateAverageRating = (ratings) => {
    if (!ratings || ratings.length === 0) return 0;
    const total = ratings.reduce((sum, r) => sum + r.rating, 0);
    return (total / ratings.length).toFixed(1);
  };
  const checkAuth = () => {
    const token =
      localStorage.getItem("token") || sessionStorage.getItem("token");
    return !!token;
  };
  const submitReview = async () => {
    if (!checkAuth()) {
      openAuthModal(navigate, {
        location,
        view: "login",
        from: location.pathname,
      });
      return;
    }
    if (!formRating) {
      toast.warning("Select a rating");
      return;
    }
    try {
      setSubmitting(true);
      const token =
        localStorage.getItem("token") || sessionStorage.getItem("token");
      const res = await fetch(`${API_BASE_URL}/ngo/${id}/rate`, {
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
        const refreshed = await fetch(`${API_BASE_URL}/ngo/${id}`);
        if (refreshed.ok) setNgo(await refreshed.json());
        setFormRating(0);
        setFormReview("");
        toast.success("Review submitted");
      } else {
        toast.error(data.message || "Failed");
      }
    } catch {
      toast.error("Error submitting review");
    } finally {
      setSubmitting(false);
    }
  };
  if (loading) return <DetailsSkeleton />;
  if (!ngo) return <div className={styles.notFound}>NGO not found</div>;
  const averageRating = calculateAverageRating(ngo?.ratings);
  const totalReviews = ngo?.ratings?.length || 0;
  return (
    <div className={styles.ngoDetails}>
      <Button
        className={styles.backBtn}
        onClick={() => navigate(-1)}
        variant="ghost"
        size="sm"
      >
        <ArrowLeft size={20} /> Back
      </Button>

      <div className={styles.ngoHeader}>
        <img
          src={
            ngo.avatar
              ? `${BASE_URL}/uploads/avatars/${ngo.avatar}`
              : "https://cdn-icons-png.flaticon.com/512/194/194279.png"
          }
          alt={ngo.name}
          className={styles.ngoAvatar}
        />

        <div className={styles.ngoInfo}>
          <div className={styles.headerTop}>
            <h1 className={styles.ngoName}>
              {ngo.roleData?.ngoName || ngo.businessName || ngo.name}
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

          <p className={styles.ngoType}>NGO / Rescue Agency</p>

          <div className={styles.detailsRow}>
            <div className={styles.detailItem}>
              <MapPin size={16} />
              <span>{formatAddress(ngo.address)}</span>
            </div>

            {ngo.roleData?.ownerName && (
              <div className={styles.detailItem}>
                <UserRoundCheck size={16} />
                <span>Organizer: {ngo.roleData.ownerName}</span>
              </div>
            )}
          </div>

          {ngo.roleData?.description && (
            <p className={styles.description}>{ngo.roleData.description}</p>
          )}

          {ngo.phone && (
            <div className={styles.actionButtons}>
              <Button
                as="a"
                href={`tel:${ngo.phone}`}
                className={styles.callButton}
                variant="outline"
                size="md"
              >
                <Phone size={20} /> <span>Call</span>
              </Button>
              <Button
                as="a"
                href={`https://wa.me/${ngo.phone}`}
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

      <div className={styles.quickNav}>
        <Button
          as="a"
          href="#pets-section"
          className={styles.navButton}
          variant="ghost"
          size="sm"
        >
          Pets
        </Button>
        <Button
          as="a"
          href="#reviews-section"
          className={styles.navButton}
          variant="ghost"
          size="sm"
        >
          Reviews
        </Button>
      </div>

      <div id="pets-section" className={styles.petsSection}>
        <SectionHeader
          className={styles.sectionHeader}
          icon={<PawPrint size={20} />}
          title="Pets for Adoption"
          count={pets.length}
          level="section"
        />

        {pets.length === 0 ? (
          <div className={styles.noPets}>No pets available.</div>
        ) : (
          <div className={styles.petsGrid}>
            {visiblePets.map((pet) => (
              <AdoptionPetCard
                key={pet._id}
                pet={pet}
                onView={handleViewPet}
                onEnquiry={handleAdoptionEnquiry}
              />
            ))}
          </div>
        )}
        {pets.length > 0 && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPetPages}
            hideIfSinglePage={false}
            onPageChange={setCurrentPage}
          />
        )}
      </div>

      <div id="reviews-section" className={styles.sectionAnchor}>
        <ReviewSection
          title="Reviews"
          count={totalReviews}
          formTitle="Write a Review"
          ratingValue={formRating}
          onRatingChange={setFormRating}
          reviewValue={formReview}
          onReviewChange={setFormReview}
          placeholder="Write your review..."
          onSubmit={submitReview}
          submitting={submitting}
          submitText="Submit Review"
          submittingText="Submitting..."
          reviews={ngo.ratings || []}
          emptyText="No reviews yet."
        />
      </div>
    </div>
  );
};
export default NgoDetails;

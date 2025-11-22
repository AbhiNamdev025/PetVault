import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Star, MapPin, PawPrint } from "lucide-react";
import { API_BASE_URL, BASE_URL } from "../../utils/constants";
import styles from "./ngoDetails.module.css";
import toast from "react-hot-toast";
import AdoptionPetCard from "../PetAdoption/AdoptionPetCard/adoptionPetCard";

const NgoDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [ngo, setNgo] = useState(null);
  const [pets, setPets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formRating, setFormRating] = useState(0);
  const [formReview, setFormReview] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [showLoginPopup, setShowLoginPopup] = useState(false);

  useEffect(() => {
    if (id) fetchNgoDetails();
  }, [id]);

  const fetchNgoDetails = async () => {
    try {
      const [ngoRes, petsRes] = await Promise.all([
        fetch(`${API_BASE_URL}/ngo/${id}`),
        fetch(`${API_BASE_URL}/ngo/${id}/pets`),
      ]);

      const ngoData = await ngoRes.json();
      const petsData = petsRes.ok ? await petsRes.json() : { pets: [] };

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
      setShowLoginPopup(true);
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
        body: JSON.stringify({ rating: formRating, review: formReview }),
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

  const handleLogin = () => {
    setShowLoginPopup(false);
    navigate("/login", { state: { from: `/ngo/${id}` } });
  };

  if (loading) return <div className={styles.loading}>Loading...</div>;
  if (!ngo) return <div className={styles.notFound}>NGO not found</div>;

  const averageRating = calculateAverageRating(ngo?.ratings);
  const totalReviews = ngo?.ratings?.length || 0;

  return (
    <div className={styles.ngoDetails}>
      <button className={styles.backBtn} onClick={() => navigate(-1)}>
        <ArrowLeft size={20} /> Back
      </button>

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
          <h1 className={styles.ngoName}>{ngo.businessName || ngo.name}</h1>

          <div className={styles.location}>
            <MapPin size={16} />
            <span>{formatAddress(ngo.address)}</span>
          </div>

          <div className={styles.rating}>
            <Star size={20} fill="#facc15" />
            <span>{averageRating > 0 ? averageRating : "No ratings yet"}</span>
            <span className={styles.reviewCount}>({totalReviews} reviews)</span>
          </div>

          {ngo.roleData?.description && (
            <p className={styles.description}>{ngo.roleData.description}</p>
          )}
        </div>
      </div>

      <div className={styles.petsSection}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>
            <PawPrint size={20} /> Pets for Adoption ({pets.length})
          </h2>
        </div>

        {pets.length === 0 ? (
          <div className={styles.noPets}>No pets available.</div>
        ) : (
          <div className={styles.petsGrid}>
            {pets.map((pet) => (
              <AdoptionPetCard
                key={pet._id}
                pet={pet}
                onView={handleViewPet}
                onEnquiry={handleAdoptionEnquiry}
              />
            ))}
          </div>
        )}
      </div>

      <div className={styles.reviewsSection}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>Reviews</h2>
          <span className={styles.reviewsCount}>({totalReviews})</span>
        </div>

        <div className={styles.reviewFormBox}>
          <h3>Write a Review</h3>

          <div className={styles.starRow}>
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                size={28}
                className={
                  formRating >= star ? styles.starActive : styles.starInactive
                }
                onClick={() => setFormRating(star)}
              />
            ))}
          </div>

          <textarea
            className={styles.reviewTextarea}
            value={formReview}
            onChange={(e) => setFormReview(e.target.value)}
            placeholder="Write your review..."
          />

          <button
            className={styles.submitReviewButton}
            onClick={submitReview}
            disabled={submitting}
          >
            {submitting ? "Submitting..." : "Submit Review"}
          </button>
        </div>

        {!totalReviews ? (
          <div className={styles.noReviews}>No reviews yet.</div>
        ) : (
          <div className={styles.reviewsGrid}>
            {ngo.ratings.map((review) => (
              <div key={review._id} className={styles.reviewCard}>
                <div className={styles.reviewHeader}>
                  <div>
                    <span className={styles.reviewerName}>
                      {review.userId?.name || "Anonymous"}
                    </span>
                    <div className={styles.starRow}>
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          size={16}
                          className={
                            review.rating >= star
                              ? styles.starActive
                              : styles.starInactive
                          }
                        />
                      ))}
                    </div>
                  </div>
                  <span className={styles.reviewDate}>
                    {new Date(review.createdAt).toLocaleDateString()}
                  </span>
                </div>

                <p className={styles.reviewText}>{review.review}</p>
              </div>
            ))}
          </div>
        )}
      </div>

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

export default NgoDetails;

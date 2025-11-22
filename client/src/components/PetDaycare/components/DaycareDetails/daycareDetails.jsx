import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Star,
  MapPin,
  UserRoundCheck,
  PawPrint,
} from "lucide-react";
import { API_BASE_URL } from "../../../../utils/constants";
import styles from "./daycareDetails.module.css";
import toast from "react-hot-toast";
const DaycareDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [daycare, setDaycare] = useState(null);
  const [caretakers, setCaretakers] = useState([]);
  const [loading, setLoading] = useState(true);

  const [formRating, setFormRating] = useState(0);
  const [formReview, setFormReview] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [showLoginPopup, setShowLoginPopup] = useState(false);

  const [activeTab, setActiveTab] = useState("about");

  useEffect(() => {
    if (id) fetchDaycareDetails();
  }, [id]);

  const fetchDaycareDetails = async () => {
    try {
      const [daycareRes, caretakerRes] = await Promise.all([
        fetch(`${API_BASE_URL}/daycare/${id}`),
        fetch(`${API_BASE_URL}/daycare/staff/${id}`),
      ]);

      const daycareData = await daycareRes.json();
      const caretakerData = caretakerRes.ok
        ? await caretakerRes.json()
        : { caretakers: [] };

      setDaycare(daycareData);
      setCaretakers(caretakerData.caretakers || []);
    } catch {
      toast.error("Failed to load daycare details");
    } finally {
      setLoading(false);
    }
  };

  const handleViewCaretaker = (caretaker) => {
    navigate(`/caretaker/${caretaker._id}`, { state: { caretaker } });
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

      const res = await fetch(`${API_BASE_URL}/daycare/${id}/rate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ rating: formRating, review: formReview }),
      });

      const data = await res.json();

      if (res.ok) {
        const refreshed = await fetch(`${API_BASE_URL}/daycare/${id}`);
        if (refreshed.ok) setDaycare(await refreshed.json());
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
    navigate("/login", { state: { from: `/daycare/${id}` } });
  };

  if (loading) return <div className={styles.loading}>Loading daycare...</div>;
  if (!daycare) return <div className={styles.notFound}>Daycare not found</div>;

  const avgRating = calculateAverageRating(daycare.ratings);
  const totalReviews = daycare.ratings?.length || 0;

  return (
    <div className={styles.daycareDetails}>
      <button className={styles.backBtn} onClick={() => navigate(-1)}>
        <ArrowLeft size={20} /> Back
      </button>

      {/* Header */}
      <div className={styles.daycareHeader}>
        <div className={styles.daycareInfo}>
          <h1 className={styles.daycareName}>
            {daycare.businessName || daycare.name}
          </h1>
          <p className={styles.daycareType}>Pet Daycare</p>

          <div className={styles.location}>
            <MapPin size={16} />
            <span>
              {daycare.address?.street}, {daycare.address?.city}
            </span>
          </div>

          <div className={styles.rating}>
            <Star size={16} fill="#facc15" />
            <span>{avgRating > 0 ? avgRating : "No ratings yet"}</span>
            <span className={styles.reviewCount}>({totalReviews} reviews)</span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className={styles.tabNavigation}>
        <button
          className={`${styles.tab} ${
            activeTab === "about" ? styles.activeTab : ""
          }`}
          onClick={() => setActiveTab("about")}
        >
          About
        </button>
        <button
          className={`${styles.tab} ${
            activeTab === "caretakers" ? styles.activeTab : ""
          }`}
          onClick={() => setActiveTab("caretakers")}
        >
          <UserRoundCheck size={16} /> Caretakers ({caretakers.length})
        </button>
      </div>

      {/* About Section */}
      {activeTab === "about" && (
        <div className={styles.aboutSection}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>About Daycare</h2>
          </div>

          {daycare.roleData?.daycareDescription && (
            <div className={styles.descriptionBox}>
              <p>{daycare.roleData.daycareDescription}</p>
            </div>
          )}

          <div className={styles.detailsGrid}>
            <div className={styles.detailItem}>
              <strong>Max Pets Allowed:</strong>
              <span>{daycare.roleData?.maxPetsAllowed || "Not specified"}</span>
            </div>
            <div className={styles.detailItem}>
              <strong>Specialization:</strong>
              <span>
                {daycare.roleData?.staffSpecialization || "General Care"}
              </span>
            </div>
            <div className={styles.detailItem}>
              <strong>Experience:</strong>
              <span>
                {daycare.roleData?.staffExperience || "Not specified"} years
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Caretakers Section */}
      {activeTab === "caretakers" && (
        <div className={styles.caretakersSection}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>
              <UserRoundCheck size={20} /> Our Caretakers ({caretakers.length})
            </h2>
          </div>

          {caretakers.length === 0 ? (
            <div className={styles.noCaretakers}>
              <p>No caretakers available at the moment.</p>
            </div>
          ) : (
            <div className={styles.caretakersScrollContainer}>
              <div className={styles.caretakersGrid}>
                {caretakers.map((caretaker) => (
                  <div key={caretaker._id} className={styles.caretakerCard}>
                    <div className={styles.caretakerImage}>
                      <img
                        src={
                          caretaker.avatar
                            ? `${API_BASE_URL.replace(
                                "/api",
                                ""
                              )}/uploads/avatars/${caretaker.avatar}`
                            : "https://cdn-icons-png.flaticon.com/512/1946/1946429.png"
                        }
                        alt={caretaker.name}
                      />
                    </div>

                    <div className={styles.caretakerInfo}>
                      <h3 className={styles.caretakerName}>{caretaker.name}</h3>
                      <p className={styles.caretakerSpecialization}>
                        {caretaker.roleData?.staffSpecialization || "Pet Care"}
                      </p>
                      <p className={styles.caretakerExperience}>
                        {caretaker.roleData?.staffExperience || 0} years
                        experience
                      </p>
                    </div>

                    <button
                      className={styles.viewProfileBtn}
                      onClick={() => handleViewCaretaker(caretaker)}
                    >
                      View Profile
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Reviews Section */}
      <div className={styles.reviewsSection}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>Customer Reviews</h2>
          <span className={styles.reviewsCount}>({totalReviews})</span>
        </div>

        {/* Review Form */}
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
            placeholder="Share your experience with this daycare..."
          />
          <button
            className={styles.submitReviewButton}
            onClick={submitReview}
            disabled={submitting}
          >
            {submitting ? "Submitting..." : "Submit Review"}
          </button>
        </div>

        {/* Reviews List */}
        {!daycare.ratings?.length ? (
          <div className={styles.noReviews}>
            <p>No reviews yet.</p>
          </div>
        ) : (
          <div className={styles.reviewsScrollContainer}>
            <div className={styles.reviewsGrid}>
              {daycare.ratings.map((review) => (
                <div key={review._id} className={styles.reviewCard}>
                  <div className={styles.reviewHeader}>
                    <div className={styles.reviewerInfo}>
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
          </div>
        )}
      </div>

      {/* Login Popup */}
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

export default DaycareDetails;

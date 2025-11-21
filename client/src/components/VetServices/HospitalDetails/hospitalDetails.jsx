import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Star, MapPin, Hospital } from "lucide-react";
import { API_BASE_URL, BASE_URL } from "../../../utils/constants";
import styles from "./hospitalDetails.module.css";
import { toast } from "react-toastify";

const HospitalDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [hospital, setHospital] = useState(null);
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);

  const [formRating, setFormRating] = useState(0);
  const [formReview, setFormReview] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [showLoginPopup, setShowLoginPopup] = useState(false);

  const fetchHospital = useCallback(async () => {
    try {
      const [hRes, dRes] = await Promise.all([
        fetch(`${API_BASE_URL}/hospital/${id}`),
        fetch(`${API_BASE_URL}/hospital/doctors/${id}`),
      ]);

      if (hRes.ok) setHospital(await hRes.json());
      else toast.error("Failed to load hospital");

      if (dRes.ok) {
        const d = await dRes.json();
        setDoctors(d.doctors || []);
      } else {
        setDoctors([]);
      }
    } catch {
      toast.error("Failed to load hospital data");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    if (id) fetchHospital();
  }, [id, fetchHospital]);

  const formatAddress = (addr) => {
    if (!addr) return "Address not available";
    const { street, city, state, zipCode } = addr;
    return [street, city, state, zipCode].filter(Boolean).join(", ");
  };

  const avgRating = (ratings) => {
    if (!ratings || ratings.length === 0) return 0;
    const total = ratings.reduce((s, r) => s + r.rating, 0);
    return (total / ratings.length).toFixed(1);
  };

  const isLoggedIn = () =>
    !!(localStorage.getItem("token") || sessionStorage.getItem("token"));

  const submitReview = async () => {
    if (!isLoggedIn()) return setShowLoginPopup(true);
    if (!formRating) return toast.warning("Select a rating");

    try {
      setSubmitting(true);

      const token =
        localStorage.getItem("token") || sessionStorage.getItem("token");

      const res = await fetch(`${API_BASE_URL}/hospital/${id}/rate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ rating: formRating, review: formReview }),
      });

      const data = await res.json();

      if (res.ok) {
        const refreshed = await fetch(`${API_BASE_URL}/hospital/${id}`);
        if (refreshed.ok) setHospital(await refreshed.json());
        setFormRating(0);
        setFormReview("");
        toast.success("Review submitted");
      } else toast.error(data.message || "Something went wrong");
    } catch {
      toast.error("Error submitting review");
    } finally {
      setSubmitting(false);
    }
  };

  const openDoctor = (dId, doctorObj) =>
    navigate(`/doctor/${dId}`, { state: { doctor: doctorObj } });

  const openHospital = (hId) => navigate(`/hospital/${hId}`);

  const handleLogin = () => {
    setShowLoginPopup(false);
    navigate("/login", { state: { from: `/hospital/${id}` } });
  };

  if (loading) return <div className={styles.loading}>Loading...</div>;
  if (!hospital)
    return <div className={styles.notFound}>Hospital not found</div>;

  const hospitalAvg = avgRating(hospital.ratings);
  const totalReviews = hospital.ratings?.length || 0;

  return (
    <div className={styles.hospitalDetails}>
      <button className={styles.backBtn} onClick={() => navigate(-1)}>
        <ArrowLeft size={18} /> Back
      </button>

      <div className={styles.header}>
        <img
          className={styles.avatar}
          src={
            hospital.avatar
              ? `${BASE_URL}/uploads/avatars/${hospital.avatar}`
              : hospital.roleData?.hospitalImages?.[0]
              ? `${BASE_URL}/uploads/roles/${hospital.roleData.hospitalImages[0]}`
              : "https://cdn-icons-png.flaticon.com/512/1995/1995574.png"
          }
          alt={hospital.roleData?.hospitalName || hospital.name}
        />

        <div className={styles.info}>
          <h1 className={styles.title}>
            {hospital.roleData?.hospitalName || hospital.name}
          </h1>

          <div className={styles.meta}>
            <MapPin size={16} />
            <span>{formatAddress(hospital.address)}</span>
          </div>

          <div className={styles.meta}>
            <Star size={16} className={styles.starIcon} />
            <span>{hospitalAvg > 0 ? hospitalAvg : "No ratings yet"}</span>
            <span className={styles.reviewCount}>({totalReviews} reviews)</span>
          </div>

          {hospital.roleData?.hospitalDescription && (
            <p className={styles.description}>
              {hospital.roleData.hospitalDescription}
            </p>
          )}
        </div>
      </div>

      <div className={styles.section}>
        <div className={styles.sectionHeader}>
          <h2>Doctors ({doctors.length})</h2>
        </div>

        {doctors.length === 0 ? (
          <div className={styles.empty}>No doctors listed.</div>
        ) : (
          <div className={styles.doctorsGrid}>
            {doctors.map((d) => {
              const avg =
                d.ratings?.length > 0
                  ? (
                      d.ratings.reduce((s, r) => s + r.rating, 0) /
                      d.ratings.length
                    ).toFixed(1)
                  : "No Ratings";

              return (
                <div key={d._id} className={styles.doctorCard}>
                  <img
                    className={styles.doctorAvatar}
                    src={
                      d.avatar
                        ? `${BASE_URL}/uploads/avatars/${d.avatar}`
                        : d.roleData?.doctorImages?.[0]
                        ? `${BASE_URL}/uploads/roles/${d.roleData.doctorImages[0]}`
                        : "https://static.vecteezy.com/system/resources/thumbnails/005/387/889/small/veterinary-doctor-doing-vaccination-for-dog-free-vector.jpg"
                    }
                    alt={d.roleData?.doctorName || d.name}
                  />

                  <div className={styles.doctorInfo}>
                    <h3 className={styles.name}>
                      {d.roleData?.doctorName || d.name}
                    </h3>

                    <p className={styles.spec}>
                      {d.roleData?.doctorSpecialization || "-"}
                    </p>

                    <div className={styles.row}>
                      <span className={styles.smallMeta}>
                        {d.roleData?.doctorExperience || "-"} yrs
                      </span>

                      <button
                        className={styles.hospitalLink}
                        onClick={() => openHospital(hospital._id)}
                      >
                        <Hospital size={14} />
                        {hospital.roleData?.hospitalName || hospital.name}
                      </button>
                    </div>

                    <div className={styles.row}>
                      <div className={styles.ratingRow}>
                        <Star size={16} className={styles.starIcon} />
                        <span>{avg}</span>
                      </div>

                      <button
                        className={styles.viewBtn}
                        onClick={() => openDoctor(d._id, d)}
                      >
                        View Profile
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className={styles.section}>
        <div className={styles.sectionHeader}>
          <h2>Reviews</h2>
        </div>

        {/* Review Form */}
        <div className={styles.reviewForm}>
          <div className={styles.starRow}>
            {[1, 2, 3, 4, 5].map((s) => (
              <Star
                key={s}
                size={22}
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
            className={styles.textarea}
            placeholder="Share your experience..."
          />

          <button
            className={styles.submit}
            onClick={submitReview}
            disabled={submitting}
          >
            {submitting ? "Submitting..." : "Submit Review"}
          </button>
        </div>

        {/* Review List */}
        <div className={styles.reviewsList}>
          {!hospital.ratings?.length ? (
            <div className={styles.empty}>No reviews yet.</div>
          ) : (
            hospital.ratings.map((r) => (
              <div key={r._id} className={styles.reviewCard}>
                <div className={styles.reviewHeaderRow}>
                  <strong className={styles.reviewerName}>
                    {r.userId?.name || "Anonymous"}
                  </strong>

                  <span className={styles.reviewDate}>
                    {new Date(r.createdAt).toLocaleDateString()}
                  </span>
                </div>

                <div className={styles.reviewRatingRow}>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      size={18}
                      className={
                        r.rating >= star
                          ? styles.starActive
                          : styles.starInactive
                      }
                    />
                  ))}
                </div>

                <p className={styles.reviewText}>{r.review}</p>
              </div>
            ))
          )}
        </div>
      </div>

      {/* LOGIN POPUP */}
      {showLoginPopup && (
        <div className={styles.popupOverlay}>
          <div className={styles.popup}>
            <h3>Login required</h3>
            <p>Please login to continue</p>

            <div className={styles.popupActions}>
              <button className={styles.popupBtn} onClick={handleLogin}>
                Login
              </button>
              <button
                className={styles.popupBtnAlt}
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

export default HospitalDetails;

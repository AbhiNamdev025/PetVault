import React, { useEffect, useState } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import { API_BASE_URL, BASE_URL } from "../../../../../utils/constants";
import toast from "react-hot-toast";
import ImageGallery from "./components/ImageGallery/imageGallery";
import InfoSection from "./components/InfoSection/infoSection";
import Tabs from "./components/Tabs/tabs";
import { DetailsSkeleton } from "../../../../Skeletons";
import { openAuthModal } from "../../../../../utils/authModalNavigation";
import styles from "./careTakerDetails.module.css";
import {
  DetailEntityCard,
  ReviewSection,
  DetailPage,
  DetailBackButton,
} from "../../../../common";
import {
  buildAllowedWeekdaySet,
  formatAvailabilityDays,
  getWeekdayTokenFromDate,
} from "../../../../../utils/weekday";
const CaretakerDetails = () => {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const cached = location.state?.caretaker;
  const [caretaker, setCaretaker] = useState(cached || null);
  const [daycare, setDaycare] = useState(null);
  const [tab, setTab] = useState("about");
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [formRating, setFormRating] = useState(0);
  const [formReview, setFormReview] = useState("");
  const [submitting, setSubmitting] = useState(false);
  useEffect(() => {
    const fetchOne = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/caretaker/${id}`);
        const data = await res.json();
        setCaretaker(data);
        if (data.roleData?.daycareId) {
          fetchDaycare(data.roleData.daycareId);
        }
      } catch {
        toast.error("Failed to load caretaker");
      }
    };
    if (cached && cached.roleData?.daycareId) {
      fetchDaycare(cached.roleData.daycareId);
    }
    fetchOne();
  }, [id]);
  const fetchDaycare = async (dId) => {
    try {
      const res = await fetch(`${API_BASE_URL}/daycare/${dId}`);
      if (res.ok) setDaycare(await res.json());
    } catch (e) {
      console.error("Failed to load daycare", e);
    }
  };
  const checkAuth = () => {
    const token =
      localStorage.getItem("token") || sessionStorage.getItem("token");
    return !!token;
  };
  const handleBookService = () => {
    if (!checkAuth()) {
      openAuthModal(navigate, {
        location,
        view: "login",
        from: location.pathname,
      });
      return;
    }
    navigate(`/book/caretaker?caretakerId=${caretaker._id}`, {
      state: {
        from: location.pathname,
        caretaker,
      },
    });
  };
  if (!caretaker) return <DetailsSkeleton />;
  const avg =
    caretaker.ratings?.length > 0
      ? (
          caretaker.ratings.reduce((s, r) => s + r.rating, 0) /
          caretaker.ratings.length
        ).toFixed(1)
      : "No Ratings";
  const getRoleImages = () => {
    const images = [];
    if (caretaker.roleData?.serviceImages)
      images.push(...caretaker.roleData.serviceImages);
    if (caretaker.roleData?.images) images.push(...caretaker.roleData.images);
    if (caretaker.roleData?.doctorImages)
      images.push(...caretaker.roleData.doctorImages);
    if (caretaker.roleData?.hospitalImages)
      images.push(...caretaker.roleData.hospitalImages);
    if (caretaker.roleData?.daycareImages)
      images.push(...caretaker.roleData.daycareImages);
    if (caretaker.roleData?.shopImages)
      images.push(...caretaker.roleData.shopImages);
    return images.filter((i) => i);
  };
  const roleImages = getRoleImages();
  const mainImage =
    roleImages.length > 0
      ? `${BASE_URL}/uploads/roleImages/${roleImages[selectedImageIndex]}`
      : caretaker.avatar
        ? `${BASE_URL}/uploads/avatars/${caretaker.avatar}`
        : "https://images.seeklogo.com/logo-png/55/1/happy-dog-logo-png_seeklogo-556954.png";
  const getAvailabilityStatus = () => {
    if (caretaker.availability?.available === false) {
      return {
        text: "Currently Unavailable",
        color: "var(--color-error)",
      };
    }
    const days = caretaker.availability?.days || [];
    const todayToken = getWeekdayTokenFromDate(new Date());
    const allowedDaySet = buildAllowedWeekdaySet(days);

    if (
      allowedDaySet.size > 0 &&
      todayToken &&
      !allowedDaySet.has(todayToken)
    ) {
      return {
        text: "Not Working Today",
        color: "var(--color-warning)",
      };
    }
    if (caretaker.availability?.startTime) {
      const now = new Date();
      const currentMinutes = now.getHours() * 60 + now.getMinutes();
      const parseTime = (t) => {
        const [h, m] = t.split(":").map(Number);
        return h * 60 + (m || 0);
      };
      const start = parseTime(caretaker.availability.startTime);
      const end = parseTime(caretaker.availability.endTime);
      if (currentMinutes >= start && currentMinutes <= end) {
        return {
          text: "Available Now",
          color: "var(--color-success)",
        };
      } else {
        return {
          text: "Outside Working Hours",
          color: "var(--color-warning)",
        };
      }
    }
    return {
      text: "Available",
      color: "var(--color-success)",
    };
  };
  const availabilityInfo = getAvailabilityStatus();
  const availabilityDayLabels = formatAvailabilityDays(
    caretaker.availability?.days || [],
  );

  const formatTime = (time) => {
    if (!time) return "";
    const [h, m] = time.split(":").map(Number);
    const ampm = h >= 12 ? "PM" : "AM";
    const hours = h % 12 || 12;
    return `${hours}:${(m || 0).toString().padStart(2, "0")} ${ampm}`;
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
      toast.error("Select rating");
      return;
    }
    try {
      setSubmitting(true);
      const res = await fetch(
        `${API_BASE_URL}/caretaker/${caretaker._id}/rate`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token") || sessionStorage.getItem("token")}`,
          },
          body: JSON.stringify({
            rating: formRating,
            review: formReview,
          }),
        },
      );
      const data = await res.json();
      if (res.ok) {
        toast.success("Review added");
        setCaretaker((p) => ({
          ...p,
          ratings: [...p.ratings, data.newRating],
        }));
        setFormRating(0);
        setFormReview("");
      } else {
        toast.error(data.message);
      }
    } catch {
      toast.error("Error");
    } finally {
      setSubmitting(false);
    }
  };
  return (
    <DetailPage className={styles.page}>
      <DetailBackButton onClick={() => navigate(-1)} />
      <div className={styles.topBox}>
        <ImageGallery
          caretaker={caretaker}
          mainImage={mainImage}
          roleImages={roleImages}
          selectedImageIndex={selectedImageIndex}
          setSelectedImageIndex={setSelectedImageIndex}
          availabilityInfo={availabilityInfo}
        />

        <div className={styles.infoWrapper}>
          <InfoSection
            caretaker={caretaker}
            avg={avg}
            setShowForm={handleBookService}
            availabilityInfo={availabilityInfo}
          />
        </div>
      </div>

      {daycare && (
        <div className={styles.daycareSection}>
          <DetailEntityCard
            avatarSrc={
              daycare.avatar
                ? `${BASE_URL}/uploads/avatars/${daycare.avatar}`
                : "https://cdn-icons-png.flaticon.com/512/1946/1946429.png"
            }
            avatarAlt={
              daycare.roleData?.daycareName ||
              daycare.businessName ||
              daycare.name
            }
            title={
              daycare.roleData?.daycareName ||
              daycare.businessName ||
              daycare.name
            }
            subtitle={
              daycare.address
                ? [
                    daycare.address.street,
                    daycare.address.city,
                    daycare.address.state,
                  ]
                    .filter(Boolean)
                    .join(", ")
                : "Trusted pet daycare"
            }
            badges={[caretaker.roleData?.daycareName || "Daycare"]}
            ctaText="View Daycare →"
            onClick={() => navigate(`/daycare/${daycare._id}`)}
            avatarFit="contain"
          />
        </div>
      )}

      <Tabs tab={tab} setTab={setTab} />

      <div className={styles.tabContent}>
        {tab === "about" && (
          <div className={styles.box}>
            <h3>About</h3>
            <p>
              {caretaker.roleData?.serviceDescription ||
                "Providing safe and loving pet care."}
            </p>
          </div>
        )}

        {tab === "skills" && (
          <div className={styles.box}>
            <h3>Skills & Services</h3>
            <ul>
              {caretaker.roleData?.servicesOffered?.length > 0 ? (
                caretaker.roleData.servicesOffered.map((s, i) => (
                  <li key={i}>{s}</li>
                ))
              ) : (
                <>
                  <li>Walks & Exercise</li>
                  <li>Overnight Pet Sitting</li>
                  <li>Grooming</li>
                  <li>Emergency Care</li>
                  <li>Basic Training</li>
                </>
              )}
            </ul>
          </div>
        )}

        {tab === "availability" && (
          <div className={styles.availabilityBox}>
            <h3>Availability Details</h3>
            <div className={styles.availabilityGrid}>
              <div className={styles.availabilityItem}>
                <strong>Status:</strong>
                <span
                  className={styles.statusBadge}
                  style={{ backgroundColor: availabilityInfo.color }}
                >
                  {availabilityInfo.text}
                </span>
              </div>

              <div className={styles.availabilityItem}>
                <strong>Working Days:</strong>
                <span>
                  {availabilityDayLabels.length > 0
                    ? availabilityDayLabels.join(", ")
                    : "Not specified"}
                </span>
              </div>

              <div className={styles.availabilityItem}>
                <strong>Working Hours:</strong>
                <span>
                  {caretaker.availability?.startTime
                    ? `${formatTime(
                        caretaker.availability.startTime,
                      )} - ${formatTime(caretaker.availability.endTime)}`
                    : "Not specified"}
                </span>
              </div>

              <div className={styles.availabilityItem}>
                <strong>Service Radius:</strong>
                <span>
                  {caretaker.availability?.serviceRadius
                    ? `${caretaker.availability.serviceRadius} km`
                    : "Not specified"}
                </span>
              </div>
            </div>

            <div className={styles.currentStatus}>
              <h4>Current Status</h4>
              <div className={styles.statusIndicator}>
                <div
                  className={styles.statusDot}
                  style={{ backgroundColor: availabilityInfo.color }}
                ></div>
                <span>{availabilityInfo.text}</span>
              </div>

              {availabilityInfo.text === "Outside Working Hours" && (
                <p className={styles.statusNote}>
                  The caretaker is currently outside working hours. You can
                  still book a service for their available days.
                </p>
              )}

              {availabilityInfo.text === "Not Working Today" && (
                <p className={styles.statusNote}>
                  The caretaker is not working today. Please check the listed
                  working days.
                </p>
              )}

              {availabilityInfo.text === "Currently Unavailable" && (
                <p className={styles.statusNote}>
                  The caretaker is currently unavailable. Please check back
                  later.
                </p>
              )}
            </div>
          </div>
        )}

        {tab === "reviews" && (
          <ReviewSection
            title="Ratings & Reviews"
            count={caretaker.ratings?.length || 0}
            formTitle="Write a Review"
            ratingValue={formRating}
            onRatingChange={setFormRating}
            reviewValue={formReview}
            onReviewChange={setFormReview}
            onSubmit={submitReview}
            submitting={submitting}
            submitText="Submit Review"
            submittingText="Submitting..."
            reviews={caretaker.ratings || []}
            emptyText="No reviews yet."
          />
        )}
      </div>
    </DetailPage>
  );
};
export default CaretakerDetails;

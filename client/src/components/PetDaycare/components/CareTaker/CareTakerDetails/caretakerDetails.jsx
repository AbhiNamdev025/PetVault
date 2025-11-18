import React, { useEffect, useState } from "react";
import { useParams, useLocation } from "react-router-dom";
import { API_BASE_URL, BASE_URL } from "../../../../../utils/constants";
import CaretakerBookingForm from "../CaretakerForm/caretakerBookingForm";
import { toast } from "react-toastify";

import ImageGallery from "./components/ImageGallery/imageGallery";
import InfoSection from "./components/InfoSection/infoSection";
import Tabs from "./components/Tabs/tabs";
import Reviews from "./components/Reviews/reviews";
import ReviewForm from "./components/ReviewForm/reviewForm";

import styles from "./careTakerDetails.module.css";

const CaretakerDetails = () => {
  const { id } = useParams();
  const location = useLocation();
  const cached = location.state?.caretaker;

  const [caretaker, setCaretaker] = useState(cached || null);
  const [tab, setTab] = useState("about");
  const [showForm, setShowForm] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  const [formRating, setFormRating] = useState(0);
  const [formReview, setFormReview] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (cached) return;

    const fetchOne = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/caretaker/${id}`);
        const data = await res.json();
        setCaretaker(data);
      } catch {
        toast.error("Failed to load caretaker");
      }
    };

    fetchOne();
  }, [id]);

  if (!caretaker) return <p>Loading...</p>;

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
      return { text: "Currently Unavailable", color: "#ef4444" };
    }

    const today = new Date().toLocaleString("en-us", { weekday: "long" });
    const days = caretaker.availability?.days || [];

    if (days.length > 0 && !days.includes(today)) {
      return { text: "Not Working Today", color: "#f59e0b" };
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
        return { text: "Available Now", color: "#10b981" };
      } else {
        return { text: "Outside Working Hours", color: "#f59e0b" };
      }
    }

    return { text: "Available", color: "#10b981" };
  };

  const availabilityInfo = getAvailabilityStatus();

  const submitReview = async () => {
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
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify({
            rating: formRating,
            review: formReview,
          }),
        }
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

  const renderStars = (r) =>
    [...Array(5)].map((_, i) => (
      <span key={i} style={{ color: i < r ? "#facc15" : "#d1d5db" }}>
        ★
      </span>
    ));

  return (
    <div className={styles.page}>
      <div className={styles.topBox}>
        <ImageGallery
          caretaker={caretaker}
          mainImage={mainImage}
          roleImages={roleImages}
          selectedImageIndex={selectedImageIndex}
          setSelectedImageIndex={setSelectedImageIndex}
          availabilityInfo={availabilityInfo}
        />

        <InfoSection
          caretaker={caretaker}
          avg={avg}
          setShowForm={setShowForm}
          availabilityInfo={availabilityInfo}
        />
      </div>

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
              <li>Walks & Exercise</li>
              <li>Overnight Pet Sitting</li>
              <li>Grooming</li>
              <li>Emergency Care</li>
              <li>Basic Training</li>
            </ul>
          </div>
        )}

        {tab === "availability" && (
          <div className={styles.box}>
            <h3>Availability Details</h3>

            <p>Status: {availabilityInfo.text}</p>

            <p>
              Working Days:{" "}
              {caretaker.availability?.days?.length > 0
                ? caretaker.availability.days.join(", ")
                : "Not specified"}
            </p>

            <p>
              Working Hours:{" "}
              {caretaker.availability?.startTime
                ? `${caretaker.availability.startTime} - ${caretaker.availability.endTime}`
                : "Not specified"}
            </p>

            <p>
              Service Radius:{" "}
              {caretaker.availability?.serviceRadius || "Not specified"}
            </p>
          </div>
        )}

        {tab === "reviews" && (
          <div className={styles.box}>
            <h3>Ratings & Reviews</h3>
            <Reviews caretaker={caretaker} renderStars={renderStars} />
          </div>
        )}
      </div>

      <ReviewForm
        formRating={formRating}
        setFormRating={setFormRating}
        formReview={formReview}
        setFormReview={setFormReview}
        submitReview={submitReview}
        submitting={submitting}
      />

      {showForm && (
        <CaretakerBookingForm
          caretaker={caretaker}
          caretakerId={caretaker._id}
          onClose={() => setShowForm(false)}
        />
      )}
    </div>
  );
};

export default CaretakerDetails;

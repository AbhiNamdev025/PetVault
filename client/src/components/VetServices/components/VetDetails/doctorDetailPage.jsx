import React, { useEffect, useState } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import { API_BASE_URL, BASE_URL } from "../../../../utils/constants";

import toast from "react-hot-toast";
import DoctorImageSection from "./components/DoctorImageSection/doctorImageSection";
import DoctorInfoSection from "./components/DoctorInfoSection/doctorInfoSection";
import DoctorTabs from "./components/DoctorTabs/doctorTabs";
import { DetailsSkeleton } from "../../../Skeletons";
import { openAuthModal } from "../../../../utils/authModalNavigation";
import {
  DetailEntityCard,
  ReviewSection,
  DetailPage,
  DetailBackButton,
} from "../../../common";
import {
  buildAllowedWeekdaySet,
  formatAvailabilityDays,
  getWeekdayTokenFromDate,
} from "../../../../utils/weekday";

import styles from "./doctorDetail.module.css";

const DoctorDetails = () => {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const cachedDoctor = location.state?.doctor;

  const [doctor, setDoctor] = useState(cachedDoctor || null);
  const [hospital, setHospital] = useState(null);

  const [tab, setTab] = useState("about");
  const [formRating, setFormRating] = useState(0);
  const [formReview, setFormReview] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (cachedDoctor) {
      loadHospital(cachedDoctor?.roleData?.hospitalId);
      return;
    }

    const fetchDoctor = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/doctor/${id}`);
        const data = await res.json();
        setDoctor(data);
        loadHospital(data.roleData?.hospitalId);
      } catch {
        toast.error("Failed to load doctor");
      }
    };

    fetchDoctor();
  }, [id]);

  const loadHospital = async (hospitalId) => {
    if (!hospitalId) return;

    try {
      const res = await fetch(`${API_BASE_URL}/hospital/${hospitalId}`);
      const data = await res.json();
      setHospital(data);
    } catch {
      console.log("Hospital fetch failed");
    }
  };

  const checkAuth = () =>
    !!(localStorage.getItem("token") || sessionStorage.getItem("token"));

  const handleBookAppointment = () => {
    if (!checkAuth()) {
      openAuthModal(navigate, {
        location,
        view: "login",
        from: location.pathname,
      });
      return;
    }
    navigate(`/book/vet?doctorId=${doctor._id}`, {
      state: {
        from: location.pathname,
        doctor,
      },
    });
  };

  if (!doctor) return <DetailsSkeleton />;

  const avgRating =
    doctor.ratings?.length > 0
      ? (
          doctor.ratings.reduce((s, r) => s + r.rating, 0) /
          doctor.ratings.length
        ).toFixed(1)
      : "No Ratings";

  const getAvailabilityStatus = () => {
    if (!doctor.availability)
      return { text: "Available", color: "var(--color-success)" };

    if (doctor.availability.available === false)
      return { text: "Currently Unavailable", color: "var(--color-error)" };

    const days = Array.isArray(doctor.availability.days)
      ? doctor.availability.days
      : [];
    const todayToken = getWeekdayTokenFromDate(new Date());
    const allowedDaySet = buildAllowedWeekdaySet(days);

    if (allowedDaySet.size > 0 && todayToken && !allowedDaySet.has(todayToken))
      return { text: "Not Working Today", color: "var(--color-warning)" };

    if (doctor.availability.startTime && doctor.availability.endTime) {
      const now = new Date();
      const current = now.getHours() * 60 + now.getMinutes();

      const parse = (t) => {
        const [h, m] = t.split(":").map(Number);
        return h * 60 + (m || 0);
      };

      const start = parse(doctor.availability.startTime);
      const end = parse(doctor.availability.endTime);

      if (current >= start && current <= end)
        return { text: "Available Now", color: "var(--color-success)" };

      return { text: "Outside Working Hours", color: "var(--color-warning)" };
    }

    return { text: "Available", color: "var(--color-success)" };
  };

  const availabilityInfo = getAvailabilityStatus();
  const availabilityDayLabels = formatAvailabilityDays(
    doctor.availability?.days || [],
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

    if (!formRating) return toast.error("Select a rating");

    try {
      setSubmitting(true);

      const res = await fetch(`${API_BASE_URL}/doctor/${doctor._id}/rate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token") || sessionStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          rating: formRating,
          review: formReview,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setDoctor((prev) => ({
          ...prev,
          ratings: [...prev.ratings, data.newRating],
        }));
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

  return (
    <DetailPage className={styles.page}>
      <DetailBackButton onClick={() => navigate(-1)} />

      <div className={styles.topSection}>
        <DoctorImageSection
          doctor={doctor}
          availabilityInfo={availabilityInfo}
        />

        <DoctorInfoSection
          doctor={doctor}
          avgRating={avgRating}
          onBookClick={handleBookAppointment}
          availabilityInfo={availabilityInfo}
        />
      </div>

      {hospital && (
        <div className={styles.hospitalBox}>
          <DetailEntityCard
            avatarSrc={
              hospital.avatar
                ? `${BASE_URL}/uploads/avatars/${hospital.avatar}`
                : hospital.roleData?.hospitalImages?.[0]
                  ? `${BASE_URL}/uploads/roles/${hospital.roleData.hospitalImages[0]}`
                  : "https://img.icons8.com/?size=512&id=99289&format=png"
            }
            avatarAlt={
              hospital.roleData?.hospitalName ||
              hospital.businessName ||
              hospital.name
            }
            title={
              hospital.roleData?.hospitalName ||
              hospital.businessName ||
              hospital.name
            }
            subtitle={
              hospital.address
                ? [
                    hospital.address.street,
                    hospital.address.city,
                    hospital.address.state,
                  ]
                    .filter(Boolean)
                    .join(", ")
                : "Trusted veterinary hospital"
            }
            badges={[doctor.roleData?.hospitalName || "Hospital"]}
            ctaText="View Hospital →"
            onClick={() => navigate(`/hospital/${hospital._id}`)}
            avatarFit="contain"
          />
        </div>
      )}

      <DoctorTabs tab={tab} setTab={setTab} />

      <div className={styles.tabContent}>
        {tab === "about" && (
          <div className={styles.aboutBox}>
            <h3>About Doctor</h3>
            <p>
              {doctor.availability?.statusNote ||
                "No information provided about the doctor."}
            </p>
          </div>
        )}

        {tab === "services" && (
          <div className={styles.servicesBox}>
            <h3>Services Offered</h3>
            <ul>
              <li>General Checkup</li>
              <li>Vaccination</li>
              <li>Emergency Care</li>
              <li>Pet Nutrition</li>
              <li>Surgery</li>
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
                  {doctor.availability?.startTime
                    ? `${formatTime(
                        doctor.availability.startTime,
                      )} - ${formatTime(doctor.availability.endTime)}`
                    : "Not specified"}
                </span>
              </div>
            </div>

            {/* Current Time Status */}
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
                  The doctor is currently outside of their working hours. You
                  can still book an appointment for their available days.
                </p>
              )}
              {availabilityInfo.text === "Not Working Today" && (
                <p className={styles.statusNote}>
                  The doctor is not working today. Please check their working
                  days for available slots.
                </p>
              )}
              {availabilityInfo.text === "Currently Unavailable" && (
                <p className={styles.statusNote}>
                  The doctor is currently unavailable. Please check back later.
                </p>
              )}
            </div>
          </div>
        )}

        {tab === "reviews" && (
          <ReviewSection
            title="Ratings & Reviews"
            count={doctor.ratings?.length || 0}
            formTitle="Write a Review"
            ratingValue={formRating}
            onRatingChange={setFormRating}
            reviewValue={formReview}
            onReviewChange={setFormReview}
            onSubmit={submitReview}
            submitting={submitting}
            submitText="Submit Review"
            submittingText="Submitting..."
            reviews={doctor.ratings || []}
            emptyText="No reviews yet."
          />
        )}
      </div>
    </DetailPage>
  );
};

export default DoctorDetails;

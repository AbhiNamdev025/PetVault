import React, { useEffect, useState } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import { API_BASE_URL } from "../../../../utils/constants";

import VetAppointmentForm from "../VetAppointment/vetAppointmentForm";
import LoginPopup from "../../../LoginPopup/loginPopup";
import { toast } from "react-toastify";

import DoctorImageSection from "./components/DoctorImageSection/doctorImageSection";
import DoctorInfoSection from "./components/DoctorInfoSection/doctorInfoSection";
import DoctorTabs from "./components/DoctorTabs/doctorTabs";
import DoctorReviews from "./components/DoctorReviews/doctorReviews";
import DoctorReviewForm from "./components/DoctorReviewForm/doctorReviewForm";

import HospitalInfoSection from "./components/HospitalInfoSection/hospitalInfoSection";

import styles from "./doctorDetail.module.css";

const DoctorDetails = () => {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const cachedDoctor = location.state?.doctor;

  const [doctor, setDoctor] = useState(cachedDoctor || null);
  const [hospital, setHospital] = useState(null);

  const [showForm, setShowForm] = useState(false);
  const [showLoginPopup, setShowLoginPopup] = useState(false);
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
      setShowLoginPopup(true);
      return;
    }
    setShowForm(true);
  };

  const handleLogin = () => {
    setShowLoginPopup(false);
    navigate("/login", { state: { from: location.pathname } });
  };

  if (!doctor) return <p className={styles.loading}>Loading...</p>;

  const avgRating =
    doctor.ratings?.length > 0
      ? (
          doctor.ratings.reduce((s, r) => s + r.rating, 0) /
          doctor.ratings.length
        ).toFixed(1)
      : "No Ratings";

  const getAvailabilityStatus = () => {
    if (!doctor.availability) return { text: "Available", color: "#10b981" };

    if (doctor.availability.available === false)
      return { text: "Currently Unavailable", color: "#ef4444" };

    const today = new Date().toLocaleString("en-us", { weekday: "long" });
    const days = doctor.availability.days || [];

    if (days.length > 0 && !days.includes(today))
      return { text: "Not Working Today", color: "#f59e0b" };

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
        return { text: "Available Now", color: "#10b981" };

      return { text: "Outside Working Hours", color: "#f59e0b" };
    }

    return { text: "Available", color: "#10b981" };
  };

  const availabilityInfo = getAvailabilityStatus();

  const submitReview = async () => {
    if (!checkAuth()) return toast.error("Please login");

    if (!formRating) return toast.error("Select a rating");

    try {
      setSubmitting(true);

      const res = await fetch(`${API_BASE_URL}/doctor/${doctor._id}/rate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
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
    <div className={styles.page}>
      <div className={styles.topSection}>
        <DoctorImageSection
          doctor={doctor}
          availabilityInfo={availabilityInfo}
        />

        <DoctorInfoSection
          doctor={doctor}
          avgRating={avgRating}
          setShowForm={handleBookAppointment}
          availabilityInfo={availabilityInfo}
        />
      </div>

      {hospital && (
        <div className={styles.hospitalBox}>
          <HospitalInfoSection hospital={hospital} />
        </div>
      )}

      <DoctorTabs tab={tab} setTab={setTab} />

      <div className={styles.tabContent}>
        {tab === "about" && (
          <div className={styles.aboutBox}>
            <h3>About Doctor</h3>
            <p>
              {doctor.roleData.serviceDescription ??
                doctor.roleData.doctorSpecialization}
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
                  {doctor.availability?.days?.length > 0
                    ? doctor.availability.days.join(", ")
                    : "Not specified"}
                </span>
              </div>

              <div className={styles.availabilityItem}>
                <strong>Working Hours:</strong>
                <span>
                  {doctor.availability?.startTime
                    ? `${doctor.availability.startTime} - ${doctor.availability.endTime}`
                    : "Not specified"}
                </span>
              </div>

              <div className={styles.availabilityItem}>
                <strong>Service Radius:</strong>
                <span>
                  {doctor.availability?.serviceRadius || "Not specified"}
                </span>
              </div>

              {doctor.availability?.statusNote && (
                <div className={styles.availabilityItem}>
                  <strong>Note:</strong>
                  <span>{doctor.availability.statusNote}</span>
                </div>
              )}
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
          <div className={styles.reviewBox}>
            <h3>Ratings & Reviews</h3>
            <DoctorReviews doctor={doctor} />
          </div>
        )}
      </div>

      <DoctorReviewForm
        formRating={formRating}
        setFormRating={setFormRating}
        formReview={formReview}
        setFormReview={setFormReview}
        submitReview={submitReview}
        submitting={submitting}
      />

      {showForm && (
        <VetAppointmentForm
          doctorId={doctor._id}
          onClose={() => setShowForm(false)}
        />
      )}

      {showLoginPopup && (
        <LoginPopup
          onClose={() => setShowLoginPopup(false)}
          onLogin={handleLogin}
        />
      )}
    </div>
  );
};

export default DoctorDetails;

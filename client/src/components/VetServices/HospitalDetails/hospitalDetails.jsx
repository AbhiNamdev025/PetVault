import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Star,
  MapPin,
  Phone,
  MessageCircle,
  Stethoscope,
  GraduationCap,
  IndianRupee,
} from "lucide-react";
import { API_BASE_URL, BASE_URL } from "../../../utils/constants";
import styles from "./hospitalDetails.module.css";
import toast from "react-hot-toast";
import { DetailsSkeleton } from "../../Skeletons";
import { openAuthModal } from "../../../utils/authModalNavigation";
import {
  Badge,
  Button,
  ListingCard,
  Pagination,
  ReviewSection,
  SectionHeader,
} from "../../common";

const HospitalDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [hospital, setHospital] = useState(null);
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formRating, setFormRating] = useState(0);
  const [formReview, setFormReview] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [itemsPerPage, setItemsPerPage] = useState(3);
  const [currentPage, setCurrentPage] = useState(1);
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

  const totalDoctorPages = Math.max(
    1,
    Math.ceil(doctors.length / itemsPerPage),
  );
  useEffect(() => {
    setCurrentPage((prev) => Math.min(prev, totalDoctorPages));
  }, [totalDoctorPages]);
  const visibleDoctors = doctors.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );
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
    if (!isLoggedIn()) {
      openAuthModal(navigate, {
        view: "login",
        from: `/hospital/${id}`,
      });
      return;
    }
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
        body: JSON.stringify({
          rating: formRating,
          review: formReview,
        }),
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
    navigate(`/doctor/${dId}`, {
      state: {
        doctor: doctorObj,
      },
    });
  if (loading) return <DetailsSkeleton />;
  if (!hospital)
    return <div className={styles.notFound}>Hospital not found</div>;
  const hospitalAvg = avgRating(hospital.ratings);
  const totalReviews = hospital.ratings?.length || 0;
  return (
    <div className={styles.hospitalDetails}>
      <Button
        className={styles.backBtn}
        onClick={() => navigate(-1)}
        variant="ghost"
        size="sm"
      >
        <ArrowLeft size={18} /> Back
      </Button>

      <div className={styles.header}>
        <img
          className={styles.avatar}
          src={
            hospital.avatar
              ? `${BASE_URL}/uploads/avatars/${hospital.avatar}`
              : hospital.roleData?.hospitalImages?.[0]
                ? `${BASE_URL}/uploads/roles/${hospital.roleData.hospitalImages[0]}`
                : "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS5gmlF6Ui768IGJDxuurDQjrhd782B21TmYw&s"
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

          {hospital.phone && (
            <div className={styles.actionButtons}>
              <Button
                as="a"
                href={`tel:${hospital.phone}`}
                className={styles.callButton}
                variant="outline"
                size="md"
              >
                <Phone size={20} /> <span>Call</span>
              </Button>
              <Button
                as="a"
                href={`https://wa.me/${hospital.phone}`}
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
          href="#doctors-section"
          className={styles.navButton}
          variant="ghost"
          size="sm"
        >
          Doctors
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

      <div id="doctors-section" className={styles.section}>
        <SectionHeader
          className={styles.sectionHeader}
          title="Doctors"
          count={doctors.length}
          level="section"
        />

        {doctors.length === 0 ? (
          <div className={styles.empty}>No doctors listed.</div>
        ) : (
          <div className={styles.doctorsGrid}>
            {visibleDoctors.map((d) => {
              const avg =
                d.ratings?.length > 0
                  ? (
                      d.ratings.reduce((s, r) => s + r.rating, 0) /
                      d.ratings.length
                    ).toFixed(1)
                  : "No Ratings";
              return (
                <ListingCard
                  key={d._id}
                  imageSrc={
                    d.avatar
                      ? `${BASE_URL}/uploads/avatars/${d.avatar}`
                      : d.roleData?.doctorImages?.[0]
                        ? `${BASE_URL}/uploads/roles/${d.roleData.doctorImages[0]}`
                        : ""
                  }
                  fallbackImageSrc="https://static.vecteezy.com/system/resources/thumbnails/005/387/889/small/veterinary-doctor-doing-vaccination-for-dog-free-vector.jpg"
                  imageAlt={d.roleData?.doctorName || d.name}
                  imageFit="contain"
                  title={d.roleData?.doctorName || d.name}
                  titleIcon={<Stethoscope size={16} />}
                  subtitle={d.roleData?.doctorSpecialization || "-"}
                  context={
                    <Badge
                      variant="warning-soft"
                      size="sm"
                      icon={<Star size={12} />}
                    >
                      {avg}
                    </Badge>
                  }
                  metaItems={[
                    {
                      icon: <GraduationCap size={13} />,
                      label: `${d.roleData?.doctorExperience || "0"} years exp.`,
                    },
                    {
                      icon: <IndianRupee size={13} />,
                      label: `${d.roleData?.consultationFee || 400}`,
                    },
                  ]}
                  className={styles.listingCard}
                  footer={
                    <Button
                      fullWidth
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        openDoctor(d._id, d);
                      }}
                      variant="primary"
                    >
                      View Profile
                    </Button>
                  }
                  as="div"
                />
              );
            })}
          </div>
        )}
        {doctors.length > 0 && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalDoctorPages}
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
          placeholder="Share your experience..."
          onSubmit={submitReview}
          submitting={submitting}
          submitText="Submit Review"
          submittingText="Submitting..."
          reviews={hospital.ratings || []}
          emptyText="No reviews yet."
        />
      </div>
    </div>
  );
};
export default HospitalDetails;

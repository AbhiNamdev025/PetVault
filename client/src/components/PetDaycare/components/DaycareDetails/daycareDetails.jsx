import React, { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import {
  ArrowLeft,
  Star,
  MapPin,
  UserRoundCheck,
  Phone,
  MessageCircle,
} from "lucide-react";
import { API_BASE_URL, BASE_URL } from "../../../../utils/constants";
import styles from "./daycareDetails.module.css";
import toast from "react-hot-toast";
import { DetailsSkeleton } from "../../../Skeletons";
import { openAuthModal } from "../../../../utils/authModalNavigation";
import {
  Badge,
  Button,
  ListingCard,
  Pagination,
  ReviewSection,
  SectionHeader,
} from "../../../common";

const DaycareDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [daycare, setDaycare] = useState(null);
  const [caretakers, setCaretakers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formRating, setFormRating] = useState(0);
  const [formReview, setFormReview] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState("about");
  const [itemsPerPage, setItemsPerPage] = useState(3);
  const [currentPage, setCurrentPage] = useState(1);
  useEffect(() => {
    if (id) fetchDaycareDetails();
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

  const totalCaretakerPages = Math.max(
    1,
    Math.ceil(caretakers.length / itemsPerPage),
  );
  useEffect(() => {
    setCurrentPage((prev) => Math.min(prev, totalCaretakerPages));
  }, [totalCaretakerPages]);
  const visibleCaretakers = caretakers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );
  const fetchDaycareDetails = async () => {
    try {
      const [daycareRes, caretakerRes] = await Promise.all([
        fetch(`${API_BASE_URL}/daycare/${id}`),
        fetch(`${API_BASE_URL}/daycare/staff/${id}`),
      ]);
      const daycareData = await daycareRes.json();
      const caretakerData = caretakerRes.ok
        ? await caretakerRes.json()
        : {
            caretakers: [],
          };
      setDaycare(daycareData);
      setCaretakers(caretakerData.caretakers || []);
    } catch {
      toast.error("Failed to load daycare details");
    } finally {
      setLoading(false);
    }
  };
  const handleViewCaretaker = (caretaker) => {
    navigate(`/caretaker/${caretaker._id}`, {
      state: {
        caretaker,
      },
    });
  };
  const calculateAverageRating = (ratings) => {
    if (!ratings || ratings.length === 0) return 0;
    const total = ratings.reduce((s, r) => s + r.rating, 0);
    return (total / ratings.length).toFixed(1);
  };
  const checkAuth = () =>
    !!(localStorage.getItem("token") || sessionStorage.getItem("token"));
  const submitReview = async () => {
    if (!checkAuth()) {
      openAuthModal(navigate, {
        location,
        view: "login",
        from: location.pathname,
      });
      return;
    }

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
        body: JSON.stringify({
          rating: formRating,
          review: formReview,
        }),
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
  if (loading) return <DetailsSkeleton />;
  if (!daycare) return <div className={styles.notFound}>Daycare not found</div>;
  const avgRating = calculateAverageRating(daycare.ratings);
  const totalReviews = daycare.ratings?.length || 0;
  const formatTimeToAmPm = (timeValue) => {
    if (!timeValue || typeof timeValue !== "string") return "";
    const [hourPart, minutePart] = timeValue.split(":");
    const hour = Number(hourPart);
    const minute = Number(minutePart);
    if (!Number.isFinite(hour) || !Number.isFinite(minute)) return timeValue;
    const amPm = hour >= 12 ? "PM" : "AM";
    const normalizedHour = hour % 12 || 12;
    return `${normalizedHour}:${String(minute).padStart(2, "0")} ${amPm}`;
  };

  const daycareDescription =
    typeof daycare.roleData?.daycareDescription === "string"
      ? daycare.roleData.daycareDescription.trim()
      : "";
  const aboutDetails = [];

  const maxPetsAllowed = Number(daycare.roleData?.maxPetsAllowed);
  if (Number.isFinite(maxPetsAllowed) && maxPetsAllowed > 0) {
    aboutDetails.push({
      label: "Max Pets Allowed",
      value: maxPetsAllowed,
    });
  }

  const workingDays = Array.isArray(daycare.availability?.days)
    ? daycare.availability.days.filter((day) => typeof day === "string" && day)
    : [];
  if (workingDays.length > 0) {
    aboutDetails.push({
      label: "Working Days",
      value: workingDays.join(", "),
    });
  }

  if (daycare.availability?.startTime && daycare.availability?.endTime) {
    const startTime = formatTimeToAmPm(daycare.availability.startTime);
    const endTime = formatTimeToAmPm(daycare.availability.endTime);
    aboutDetails.push({
      label: "Working Hours",
      value: `${startTime} - ${endTime}`,
    });
  }

  const serviceRadius = Number(daycare.availability?.serviceRadius);

  return (
    <div className={styles.daycareDetails}>
      <Button
        className={styles.backBtn}
        onClick={() => navigate(-1)}
        variant="ghost"
        size="sm"
      >
        <ArrowLeft size={20} /> Back
      </Button>

      {/* Header */}
      <div className={styles.daycareHeader}>
        <img
          src={
            daycare.avatar
              ? `${BASE_URL}/uploads/avatars/${daycare.avatar}`
              : "https://thumbs.dreamstime.com/b/dog-daycare-center-logo-design-template-vector-illustration-dog-daycare-center-logo-design-template-vector-illustration-266164283.jpg"
          }
          alt={daycare.businessName}
          className={styles.daycareAvatar}
        />
        <div className={styles.daycareInfo}>
          <div className={styles.headerTop}>
            <h1 className={styles.daycareName}>
              {daycare.roleData?.daycareName ||
                daycare.businessName ||
                daycare.name}
            </h1>
            <div className={styles.ratingBadge}>
              <Star
                size={16}
                fill="var(--color-warning)"
                stroke="var(--color-warning)"
              />
              <span>{avgRating > 0 ? avgRating : "New"}</span>
              <span className={styles.reviewCount}>
                ({totalReviews} reviews)
              </span>
            </div>
          </div>

          <p className={styles.daycareType}>Pet Daycare</p>

          <div className={styles.detailsRow}>
            <div className={styles.detailItem}>
              <MapPin size={16} />
              <span>
                {daycare.address?.street}, {daycare.address?.city}
              </span>
            </div>

            {daycare.roleData?.ownerName && (
              <div className={styles.detailItem}>
                <UserRoundCheck size={16} />
                <span>Owner: {daycare.roleData.ownerName}</span>
              </div>
            )}
          </div>

          <div className={styles.actionButtons}>
            {daycare.phone && (
              <>
                <Button
                  as="a"
                  href={`tel:${daycare.phone}`}
                  className={styles.callButton}
                  variant="outline"
                  size="md"
                >
                  <Phone size={20} /> <span>Call</span>
                </Button>
                <Button
                  as="a"
                  href={`https://wa.me/${daycare.phone}`}
                  target="_blank"
                  className={styles.whatsappButton}
                  variant="success"
                  size="md"
                >
                  <MessageCircle size={20} /> <span>WhatsApp</span>
                </Button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className={styles.tabNavigation}>
        <Button
          className={`${styles.tab} ${activeTab === "about" ? styles.activeTab : ""}`}
          onClick={() => setActiveTab("about")}
          variant="ghost"
          size="sm"
        >
          About
        </Button>
        <Button
          className={`${styles.tab} ${activeTab === "caretakers" ? styles.activeTab : ""}`}
          onClick={() => setActiveTab("caretakers")}
          variant="ghost"
          size="sm"
        >
          <UserRoundCheck size={16} /> Caretakers ({caretakers.length})
        </Button>
        <Button
          className={styles.tab}
          as="a"
          href="#reviews-section"
          variant="ghost"
          size="sm"
        >
          Reviews
        </Button>
      </div>

      {/* About Section */}
      {activeTab === "about" && (
        <div id="about-section" className={styles.aboutSection}>
          <SectionHeader
            className={styles.sectionHeader}
            title="About Daycare"
            level="section"
          />

          {daycareDescription && (
            <div className={styles.descriptionBox}>
              <p>{daycareDescription}</p>
            </div>
          )}

          {aboutDetails.length > 0 ? (
            <div className={styles.detailsGrid}>
              {aboutDetails.map((detail) => (
                <div className={styles.aboutDetailItem} key={detail.label}>
                  <strong>{detail.label}:</strong>
                  <span>{detail.value}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className={styles.emptyAboutMessage}>
              Daycare profile details are not updated yet.
            </p>
          )}
        </div>
      )}

      {/* Caretakers Section */}
      {activeTab === "caretakers" && (
        <div id="caretakers-section" className={styles.caretakersSection}>
          <SectionHeader
            className={styles.sectionHeader}
            icon={<UserRoundCheck size={20} />}
            title="Our Caretakers"
            count={caretakers.length}
            level="section"
          />

          {caretakers.length === 0 ? (
            <div className={styles.noCaretakers}>
              <p>No caretakers available at the moment.</p>
            </div>
          ) : (
            <div className={styles.caretakersScrollContainer}>
              <div className={styles.caretakersGrid}>
                {visibleCaretakers.map((caretaker) => {
                  const avgRating = caretaker.ratings?.length
                    ? (
                        caretaker.ratings.reduce(
                          (sum, rating) => sum + rating.rating,
                          0,
                        ) / caretaker.ratings.length
                      ).toFixed(1)
                    : "No Ratings";
                  return (
                    <ListingCard
                      key={caretaker._id}
                      imageSrc={
                        caretaker.avatar
                          ? `${API_BASE_URL.replace("/api", "")}/uploads/avatars/${caretaker.avatar}`
                          : ""
                      }
                      fallbackImageSrc="https://cdn-icons-png.flaticon.com/512/1946/1946429.png"
                      imageAlt={caretaker.name}
                      imageFit="contain"
                      title={caretaker.name}
                      subtitle={
                        caretaker.roleData?.staffSpecialization || "Pet Care"
                      }
                      context={
                        <Badge
                          variant="warning-soft"
                          size="sm"
                          icon={<Star size={12} />}
                        >
                          {avgRating}
                        </Badge>
                      }
                      metaItems={[
                        {
                          icon: <UserRoundCheck size={13} />,
                          label: `${caretaker.roleData?.staffExperience || 0} years experience`,
                        },
                      ]}
                      className={styles.listingCard}
                      footer={
                        <Button
                          fullWidth
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleViewCaretaker(caretaker);
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
              <Pagination
                currentPage={currentPage}
                totalPages={totalCaretakerPages}
                hideIfSinglePage={false}
                onPageChange={setCurrentPage}
              />
            </div>
          )}
        </div>
      )}

      <div id="reviews-section" className={styles.sectionAnchor}>
        <ReviewSection
          title="Customer Reviews"
          count={totalReviews}
          formTitle="Write a Review"
          ratingValue={formRating}
          onRatingChange={setFormRating}
          reviewValue={formReview}
          onReviewChange={setFormReview}
          placeholder="Share your experience with this daycare..."
          onSubmit={submitReview}
          submitting={submitting}
          submitText="Submit Review"
          submittingText="Submitting..."
          reviews={daycare.ratings || []}
          emptyText="No reviews yet."
        />
      </div>
    </div>
  );
};
export default DaycareDetails;

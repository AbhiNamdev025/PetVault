import React, { useEffect, useState } from "react";
import styles from "./caretakerCards.module.css";
import {
  User2,
  MapPin,
  Star,
  Shield,
  XCircle,
  Building,
  PawPrint,
  BadgeIndianRupee,
} from "lucide-react";
import { API_BASE_URL, BASE_URL } from "../../../../../utils/constants";
import { useNavigate } from "react-router-dom";
import { VetCardSkeleton } from "../../../../Skeletons";
import {
  Badge,
  Button,
  EmptyState,
  ListingCard,
  Pagination,
  SearchFilterBar,
  SectionHeader,
} from "../../../../common";

const ITEMS_PER_PAGE = 8;

const CaretakerCards = ({ onBookNow }) => {
  const [caretakers, setCaretakers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCaretakers = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/caretaker`);
        const data = await res.json();
        const sorted = (Array.isArray(data) ? data : []).sort((a, b) => {
          const A = a.ratings?.length
            ? a.ratings.reduce((t, r) => t + r.rating, 0) / a.ratings.length
            : 0;
          const B = b.ratings?.length
            ? b.ratings.reduce((t, r) => t + r.rating, 0) / b.ratings.length
            : 0;
          return B - A;
        });
        setCaretakers(sorted);
      } catch (err) {
        console.error("Failed to fetch caretakers:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchCaretakers();
  }, []);

  const goToDetails = (c) =>
    navigate(`/caretaker/${c._id}`, {
      state: {
        caretaker: c,
      },
    });

  const goToDaycare = (id) => {
    navigate(`/daycare/${id}`);
  };

  const getAvailabilityStatus = (c) => {
    if (c.availability?.available === false) {
      return {
        status: "unavailable",
        text: "Unavailable",
        color: "var(--color-error)",
      };
    }
    return {
      status: "available",
      text: "Available Now",
      color: "var(--color-success)",
    };
  };

  const filteredCaretakers = caretakers.filter((c) => {
    const query = searchTerm.trim().toLowerCase();
    if (!query) return true;

    const searchPool = [
      c.name,
      c.roleData?.daycareName,
      c.roleData?.staffSpecialization,
      c.roleData?.serviceDescription,
      Array.isArray(c.roleData?.servicesOffered)
        ? c.roleData.servicesOffered.join(" ")
        : c.roleData?.servicesOffered,
    ];

    return searchPool.some((value) =>
      String(value || "")
        .toLowerCase()
        .includes(query),
    );
  });
  const totalPages = Math.max(
    1,
    Math.ceil(filteredCaretakers.length / ITEMS_PER_PAGE),
  );

  useEffect(() => {
    setCurrentPage((prev) => Math.min(prev, totalPages));
  }, [totalPages]);

  const visibleCaretakers = filteredCaretakers.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE,
  );
  const hasActiveSearch = searchTerm.trim().length > 0;

  return (
    <section className={styles.section}>
      <SectionHeader
        className={styles.header}
        level="section"
        align="center"
        title="Trusted Caretakers"
        icon={<PawPrint />}
        subtitle="Experienced caretakers from verified daycare providers."
        actions={
          <SearchFilterBar
            searchPlaceholder="Search by caretaker, daycare, or specialization..."
            searchValue={searchTerm}
            onSearchChange={(value) => {
              setSearchTerm(value);
              setCurrentPage(1);
            }}
            resultText={`${filteredCaretakers.length} caretakers found`}
          />
        }
      />

      {loading ? (
        <div className={styles.grid}>
          {Array.from({ length: 8 }).map((_, i) => (
            <VetCardSkeleton key={i} />
          ))}
        </div>
      ) : filteredCaretakers.length === 0 ? (
        <div className={styles.emptyStateWrap}>
          <EmptyState
            icon={<PawPrint size={34} />}
            title={
              hasActiveSearch
                ? "No Caretakers Found"
                : "No Caretakers Available"
            }
            description={
              hasActiveSearch
                ? "No caretakers match your search. Try a different caretaker, daycare, or specialization."
                : "Caretaker listings are currently unavailable. Please check back soon."
            }
            action={
              hasActiveSearch ? (
                <Button
                  variant="ghost"
                  size="md"
                  onClick={() => setSearchTerm("")}
                >
                  Clear Search
                </Button>
              ) : null
            }
          />
        </div>
      ) : (
        <div className={styles.grid}>
          {visibleCaretakers.map((c) => {
            const avg = c.ratings?.length
              ? (
                  c.ratings.reduce((t, r) => t + r.rating, 0) / c.ratings.length
                ).toFixed(1)
              : "—";
            const dailyPrice = Number(
              c.roleData?.hourlyRate ?? c.roleData?.charges ?? 0,
            );
            const availability = getAvailabilityStatus(c);
            const daycareName = c.roleData?.daycareName;
            const hasDaycare = !!c.roleData?.daycareId || !!daycareName;

            return (
              <ListingCard
                key={c._id}
                onClick={() => goToDetails(c)}
                imageSrc={
                  c.avatar ? `${BASE_URL}/uploads/avatars/${c.avatar}` : ""
                }
                fallbackImageSrc="https://images.seeklogo.com/logo-png/55/1/happy-dog-logo-png_seeklogo-556954.png"
                imageAlt={c.name}
                badges={[
                  {
                    position: "top-left",
                    content: (
                      <Badge
                        variant={
                          availability.status === "available"
                            ? "success"
                            : "error"
                        }
                        size="sm"
                        icon={
                          availability.status === "available" ? (
                            <Shield size={12} />
                          ) : (
                            <XCircle size={12} />
                          )
                        }
                      >
                        {availability.text}
                      </Badge>
                    ),
                  },
                ]}
                title={c.name}
                headerRight={
                  <Button
                    type="button"
                    className={styles.entityContextButton}
                    onClick={(e) => {
                      e.stopPropagation();
                      if (hasDaycare) {
                        goToDaycare(c.roleData.daycareId);
                      }
                    }}
                    disabled={!hasDaycare}
                    variant="primary"
                    size="md"
                  >
                    {hasDaycare ? <Building size={14} /> : <MapPin size={14} />}
                    <span>
                      {hasDaycare
                        ? daycareName || "Daycare Center"
                        : "Independent"}
                    </span>
                  </Button>
                }
                subtitle={c.roleData?.staffSpecialization || "Pet Care"}
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
                    icon: <User2 size={14} />,
                    label: `${c.roleData?.staffExperience ?? 0} yrs`,
                  },
                  {
                    icon: <BadgeIndianRupee size={14} />,
                    label:
                      dailyPrice > 0
                        ? `₹${dailyPrice}/day`
                        : "Price on request",
                  },
                ]}
                as="div"
                footer={
                  <Button
                    fullWidth
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (onBookNow) {
                        onBookNow(c, "daycare");
                        return;
                      }
                      goToDetails(c);
                    }}
                    disabled={c.availability?.available === false}
                    variant="primary"
                  >
                    {c.availability?.available === false
                      ? "Unavailable"
                      : onBookNow
                        ? "Book"
                        : "View Profile"}
                  </Button>
                }
              />
            );
          })}
        </div>
      )}

      {!loading && filteredCaretakers.length > 0 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      )}
    </section>
  );
};

export default CaretakerCards;

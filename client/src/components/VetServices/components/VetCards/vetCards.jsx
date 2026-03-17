import React, { useEffect, useState } from "react";
import styles from "./vetCards.module.css";
import {
  GraduationCap,
  Star,
  Shield,
  XCircle,
  Stethoscope,
  Hospital as HospitalIcon,
  BadgeIndianRupee,
} from "lucide-react";
import { API_BASE_URL, BASE_URL } from "../../../../utils/constants";
import { useNavigate } from "react-router-dom";
import { VetCardSkeleton } from "../../../Skeletons";
import {
  Badge,
  Button,
  EmptyState,
  ListingCard,
  Pagination,
  SearchFilterBar,
  SectionHeader,
} from "../../../common";

const ITEMS_PER_PAGE = 8;

const VetCards = ({ onBookNow }) => {
  const [vets, setVets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchVets = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/doctor`);
        const data = await res.json();
        const arr = Array.isArray(data) ? data : data.doctors || [];
        const sorted = arr.sort((a, b) => {
          const A = a.ratings?.length
            ? a.ratings.reduce((t, r) => t + r.rating, 0) / a.ratings.length
            : 0;
          const B = b.ratings?.length
            ? b.ratings.reduce((t, r) => t + r.rating, 0) / b.ratings.length
            : 0;
          return B - A;
        });
        setVets(sorted);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchVets();
  }, []);

  const goToDoctor = (doctor) => {
    navigate(`/doctor/${doctor._id}`, {
      state: {
        doctor,
      },
    });
  };

  const goToHospital = (hospitalId) => {
    if (!hospitalId) return;
    navigate(`/hospital/${hospitalId}`);
  };

  const getAvailabilityStatus = (vet) => {
    if (vet.availability?.available === false) {
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

  const filteredVets = vets.filter((v) => {
    const query = searchTerm.trim().toLowerCase();
    if (!query) return true;

    const searchPool = [
      v.roleData?.doctorName || v.name,
      v.roleData?.hospitalName,
      v.roleData?.doctorSpecialization,
      v.roleData?.serviceDescription,
      Array.isArray(v.roleData?.servicesOffered)
        ? v.roleData.servicesOffered.join(" ")
        : v.roleData?.servicesOffered,
    ];

    return searchPool.some((value) =>
      String(value || "")
        .toLowerCase()
        .includes(query),
    );
  });
  const totalPages = Math.max(
    1,
    Math.ceil(filteredVets.length / ITEMS_PER_PAGE),
  );

  useEffect(() => {
    setCurrentPage((prev) => Math.min(prev, totalPages));
  }, [totalPages]);

  const visibleVets = filteredVets.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE,
  );
  const hasActiveSearch = searchTerm.trim().length > 0;

  return (
    <section className={styles.vetCardsSection}>
      <SectionHeader
        className={styles.header}
        level="section"
        align="center"
        icon={<Stethoscope />}
        title="Meet Our Trusted Veterinarians"
        subtitle="Experienced professionals dedicated to your pet's health and wellbeing."
        actions={
          <SearchFilterBar
            searchPlaceholder="Search by doctor, hospital, or specialization..."
            searchValue={searchTerm}
            onSearchChange={(value) => {
              setSearchTerm(value);
              setCurrentPage(1);
            }}
            resultText={`${filteredVets.length} vets found`}
          />
        }
      />

      <div className={styles.cardsContainer}>
        {loading ? (
          Array.from({ length: 8 }).map((_, i) => <VetCardSkeleton key={i} />)
        ) : filteredVets.length === 0 ? (
          <div className={styles.emptyStateWrap}>
            <EmptyState
              icon={<Stethoscope size={34} />}
              title={hasActiveSearch ? "No Vets Found" : "No Vets Available"}
              description={
                hasActiveSearch
                  ? "No veterinarians match your search. Try another doctor, hospital, or specialization."
                  : "Veterinarian listings are currently unavailable. Please check back soon."
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
          visibleVets.map((vet) => {
            const avgRating = vet.ratings?.length
              ? (
                  vet.ratings.reduce((t, r) => t + r.rating, 0) /
                  vet.ratings.length
                ).toFixed(1)
              : "No Ratings";
            const consultationFee = Number(
              vet.roleData?.consultationFee ?? vet.roleData?.charges ?? 0,
            );
            const availability = getAvailabilityStatus(vet);
            const hospitalId = vet.roleData?.hospitalId;

            return (
              <ListingCard
                key={vet._id}
                onClick={() => goToDoctor(vet)}
                imageSrc={
                  vet.avatar
                    ? `${BASE_URL}/uploads/avatars/${vet.avatar}`
                    : vet.roleData?.doctorImages?.[0]?.startsWith("http")
                      ? vet.roleData.doctorImages[0]
                      : ""
                }
                fallbackImageSrc="https://static.vecteezy.com/system/resources/thumbnails/005/387/889/small/veterinary-doctor-doing-vaccination-for-dog-free-vector.jpg"
                imageAlt={vet.roleData?.doctorName || vet.name}
                badges={[
                  {
                    position: "top-right",
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
                title={vet.roleData?.doctorName || vet.name}
                titleIcon={<Stethoscope size={18} />}
                headerRight={
                  <Button
                    type="button"
                    className={styles.entityContextButton}
                    onClick={(e) => {
                      e.stopPropagation();
                      goToHospital(hospitalId);
                    }}
                    disabled={!hospitalId}
                    variant="primary"
                    size="md"
                  >
                    <HospitalIcon size={14} />
                    <span>{vet.roleData?.hospitalName || "Hospital"}</span>
                  </Button>
                }
                subtitle={vet.roleData?.doctorSpecialization}
                context={
                  <Badge
                    variant="warning-soft"
                    size="sm"
                    icon={<Star size={12} />}
                  >
                    {avgRating}
                  </Badge>
                }
                description={vet.roleData?.serviceDescription}
                metaItems={[
                  {
                    icon: <GraduationCap size={14} />,
                    label: `${vet.roleData?.doctorExperience || "-"} yrs`,
                  },
                  {
                    icon: <BadgeIndianRupee size={14} />,
                    label:
                      consultationFee > 0
                        ? `₹${consultationFee}/visit`
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
                        onBookNow(vet);
                        return;
                      }
                      goToDoctor(vet);
                    }}
                    disabled={vet.availability?.available === false}
                    variant="primary"
                  >
                    {vet.availability?.available === false
                      ? "Unavailable"
                      : onBookNow
                        ? "Book"
                        : "View Details & Book"}
                  </Button>
                }
              />
            );
          })
        )}
      </div>

      {!loading && filteredVets.length > 0 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      )}
    </section>
  );
};

export default VetCards;

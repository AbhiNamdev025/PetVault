import React, { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import styles from "./PetProfile.module.css";
import {
  Activity,
  AlertCircle,
  Calendar,
  ShieldCheck,
  Store,
  ExternalLink,
  Tag,
  ClipboardList,
  ArrowLeft,
  User as UserIcon,
  Phone,
  Mail,
} from "lucide-react";
import { API_BASE_URL, BASE_URL } from "../../../../../utils/constants";
import { DetailsSkeleton } from "../../../../Skeletons/index";
import PetAppointments from "./PetAppointments";
import PetReports from "./PetReports";
import toast from "react-hot-toast";
import { Badge, Button, EmptyState } from "../../../../common";

const toIdString = (value) => {
  if (!value) return "";
  if (typeof value === "string") return value;
  if (typeof value === "object") {
    return value._id?.toString?.() || value.id?.toString?.() || "";
  }
  return "";
};

const normalizeText = (value) =>
  typeof value === "string" ? value.trim().toLowerCase() : "";

const pickFirstNonEmpty = (...values) =>
  values.find((value) => typeof value === "string" && value.trim()) || "";

const formatAddress = (address) => {
  if (!address) return "N/A";
  if (typeof address === "string") {
    const trimmed = address.trim();
    return trimmed || "N/A";
  }
  if (typeof address === "object") {
    const combined = [
      address.street,
      address.city,
      address.state,
      address.zipCode,
    ]
      .filter(Boolean)
      .join(", ");
    return combined || "N/A";
  }
  return "N/A";
};

const resolveSourceTypeFromAppointment = (appointment) => {
  const providerRole = normalizeText(appointment?.providerId?.role);
  if (providerRole === "shop" || providerRole === "ngo") return providerRole;

  const providerType = normalizeText(appointment?.providerType);
  if (providerType === "shop" || providerType === "ngo") return providerType;

  const service = normalizeText(appointment?.service);
  if (service === "shop") return "shop";
  if (service === "pet_adoption" || service === "adoption") return "ngo";

  return "";
};

const PetProfileContent = ({
  petId,
  isMinimal = false,
  initialTab = "overview",
}) => {
  const navigate = useNavigate();
  const [pet, setPet] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(initialTab || "overview");
  const [resolvedSource, setResolvedSource] = useState(null);
  const [loadingSource, setLoadingSource] = useState(false);
  const [fallbackSource, setFallbackSource] = useState(null);
  const [fallbackSourceType, setFallbackSourceType] = useState("");
  const [loadingFallbackSource, setLoadingFallbackSource] = useState(false);

  const sourceRefFromPet = pet?.originNgoId || pet?.originShopId || null;
  const sourceTypeFromPet = pet?.originNgoId
    ? "ngo"
    : pet?.originShopId
      ? "shop"
      : "";
  const sourceIdFromPet = toIdString(sourceRefFromPet);

  useEffect(() => {
    const fetchPetData = async () => {
      if (!petId) return;
      try {
        setLoading(true);
        const token =
          localStorage.getItem("token") || sessionStorage.getItem("token");
        const res = await fetch(`${API_BASE_URL}/user-pets/${petId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (!res.ok) throw new Error("Failed to fetch pet details");
        const data = await res.json();
        setPet(data);
      } catch (error) {
        console.error("Error fetching pet:", error);
        toast.error("Could not load pet profile");
      } finally {
        setLoading(false);
      }
    };
    fetchPetData();
  }, [petId]);
  useEffect(() => {
    const allowedTabs = [
      "overview",
      "medical",
      "source",
      "appointments",
      "reports",
    ];
    const normalizedTab = (initialTab || "overview").toLowerCase();
    setActiveTab(
      allowedTabs.includes(normalizedTab) ? normalizedTab : "overview",
    );
  }, [initialTab, petId]);
  useEffect(() => {
    if (!pet?._id) {
      setResolvedSource(null);
      setLoadingSource(false);
      return;
    }

    const sourceEntityFromPet =
      sourceRefFromPet && typeof sourceRefFromPet === "object"
        ? sourceRefFromPet
        : null;
    setResolvedSource(sourceEntityFromPet);

    if (!sourceIdFromPet || !sourceTypeFromPet) {
      setLoadingSource(false);
      return;
    }

    let isMounted = true;
    const fetchSourceDetails = async () => {
      try {
        setLoadingSource(true);
        const endpoint = `${API_BASE_URL}/${sourceTypeFromPet}/${encodeURIComponent(sourceIdFromPet)}`;
        const res = await fetch(endpoint);
        if (!res.ok) throw new Error("Failed to fetch source details");
        const data = await res.json();
        if (isMounted) {
          setResolvedSource((prevSource) => {
            const previous =
              prevSource && typeof prevSource === "object" ? prevSource : {};
            const next = data && typeof data === "object" ? data : {};
            const previousRoleData =
              previous.roleData && typeof previous.roleData === "object"
                ? previous.roleData
                : {};
            const nextRoleData =
              next.roleData && typeof next.roleData === "object"
                ? next.roleData
                : {};

            return {
              ...previous,
              ...next,
              roleData: {
                ...previousRoleData,
                ...nextRoleData,
              },
            };
          });
        }
      } catch {
        if (isMounted) {
          setResolvedSource(sourceEntityFromPet);
        }
      } finally {
        if (isMounted) {
          setLoadingSource(false);
        }
      }
    };

    fetchSourceDetails();
    return () => {
      isMounted = false;
    };
  }, [pet?._id, sourceIdFromPet, sourceTypeFromPet, sourceRefFromPet]);
  useEffect(() => {
    if (!pet?._id || sourceIdFromPet) {
      setFallbackSource(null);
      setFallbackSourceType("");
      setLoadingFallbackSource(false);
      return;
    }

    setFallbackSource(null);
    setFallbackSourceType("");

    let isMounted = true;
    const fetchFallbackSourceFromHistory = async () => {
      try {
        setLoadingFallbackSource(true);
        const token =
          localStorage.getItem("token") || sessionStorage.getItem("token");
        if (!token) return;

        const res = await fetch(
          `${API_BASE_URL}/appointments/pet-history/${pet._id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );

        if (!res.ok) return;
        const data = await res.json();
        const history = Array.isArray(data?.history) ? data.history : [];
        const sourceAppointment = history.find((appointment) =>
          Boolean(resolveSourceTypeFromAppointment(appointment)),
        );

        if (!isMounted) return;
        if (!sourceAppointment) {
          setFallbackSource(null);
          setFallbackSourceType("");
          return;
        }

        setFallbackSource(
          sourceAppointment?.providerId &&
            typeof sourceAppointment.providerId === "object"
            ? sourceAppointment.providerId
            : null,
        );
        setFallbackSourceType(
          resolveSourceTypeFromAppointment(sourceAppointment),
        );
      } finally {
        if (isMounted) {
          setLoadingFallbackSource(false);
        }
      }
    };

    fetchFallbackSourceFromHistory();
    return () => {
      isMounted = false;
    };
  }, [pet?._id, sourceIdFromPet]);
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };
  const getVaccStatus = (nextDueDate) => {
    if (!nextDueDate) return null;
    const today = new Date();
    const due = new Date(nextDueDate);
    const diffDays = Math.ceil((due - today) / (1000 * 60 * 60 * 24));
    if (diffDays < 0) return "Overdue";
    if (diffDays <= 7) return "Due Soon";
    return "Upcoming";
  };
  const sanitizeListValues = (values) => {
    if (!Array.isArray(values)) return [];
    const placeholders = new Set([
      "",
      "-",
      "n/a",
      "na",
      "none",
      "nil",
      "null",
      "undefined",
      "nd",
    ]);
    return values
      .map((value) => String(value ?? "").trim())
      .filter((value) => value && !placeholders.has(value.toLowerCase()));
  };
  const getAgeLabel = () => {
    if (!pet) return "N/A";
    if (pet.age) {
      const unit = pet.ageUnit || "Years";
      return `${pet.age} ${unit.charAt(0).toUpperCase()}${unit.slice(1)}`;
    }
    if (pet.dob) {
      const dob = new Date(pet.dob);
      const today = new Date();
      let years = today.getFullYear() - dob.getFullYear();
      const m = today.getMonth() - dob.getMonth();
      if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) {
        years -= 1;
      }
      return `${Math.max(0, years)} Years`;
    }
    return "N/A";
  };
  const getOwnerAvatarSrc = () => {
    const rawAvatar = pet?.owner?.avatar;
    const ownerName = pet?.owner?.name || "Owner";
    if (!rawAvatar) {
      return `https://ui-avatars.com/api/?name=${encodeURIComponent(ownerName)}&background=E5E7EB&color=111827`;
    }
    const normalizedAvatar = String(rawAvatar).replace(/\\/g, "/");
    if (
      normalizedAvatar.startsWith("http://") ||
      normalizedAvatar.startsWith("https://")
    ) {
      return normalizedAvatar;
    }
    if (normalizedAvatar.startsWith("/uploads/")) {
      return `${BASE_URL}${normalizedAvatar}`;
    }
    if (normalizedAvatar.startsWith("uploads/")) {
      return `${BASE_URL}/${normalizedAvatar}`;
    }
    return `${BASE_URL}/uploads/avatars/${normalizedAvatar}`;
  };
  if (loading) return <DetailsSkeleton />;
  if (!pet) return <div className={styles.errorPage}>Pet not found</div>;
  const medicalConditions = sanitizeListValues(pet.medicalConditions);
  const allergies = sanitizeListValues(pet.allergies);
  const vaccinations = Array.isArray(pet.vaccinations) ? pet.vaccinations : [];
  const effectiveSourceType = sourceTypeFromPet || fallbackSourceType;
  const effectiveSourceEntity = resolvedSource || fallbackSource;
  const effectiveSourceRoleData =
    effectiveSourceEntity?.roleData &&
    typeof effectiveSourceEntity.roleData === "object"
      ? effectiveSourceEntity.roleData
      : {};
  const effectiveSourceId =
    sourceIdFromPet || toIdString(effectiveSourceEntity);
  const sourceTypeLabel =
    effectiveSourceType === "ngo"
      ? "NGO"
      : effectiveSourceType === "shop"
        ? "Shop"
        : "Source";
  const sourceName =
    pickFirstNonEmpty(
      effectiveSourceRoleData.ngoName,
      effectiveSourceRoleData.shopName,
      effectiveSourceRoleData.entityName,
      effectiveSourceEntity?.businessName,
      effectiveSourceEntity?.name,
      effectiveSourceRoleData.ownerName,
    ) ||
    (effectiveSourceId
      ? `${sourceTypeLabel} #${effectiveSourceId.slice(-6).toUpperCase()}`
      : "N/A");
  const sourceEmail =
    pickFirstNonEmpty(
      effectiveSourceEntity?.email,
      effectiveSourceRoleData.ownerEmail,
      effectiveSourceRoleData.email,
    ) || "N/A";
  const sourcePhone =
    pickFirstNonEmpty(
      effectiveSourceEntity?.phone,
      effectiveSourceRoleData.ownerPhone,
      effectiveSourceRoleData.phone,
    ) || "N/A";
  const sourceAddress = formatAddress(
    effectiveSourceEntity?.address ||
      effectiveSourceRoleData.address ||
      effectiveSourceRoleData.shopAddress ||
      effectiveSourceRoleData.ngoAddress,
  );
  const acquisitionTypeRaw = normalizeText(pet?.acquisitionType);
  const acquisitionType =
    acquisitionTypeRaw === "bought" || acquisitionTypeRaw === "adopted"
      ? acquisitionTypeRaw
      : effectiveSourceType === "ngo"
        ? "adopted"
        : effectiveSourceType === "shop"
          ? "bought"
          : "manual";
  const acquisitionLabel =
    acquisitionType === "adopted"
      ? "Adopted"
      : acquisitionType === "bought"
        ? "Bought"
        : "Manual Entry";
  const acquisitionBadgeVariant =
    acquisitionType === "adopted"
      ? "success-soft"
      : acquisitionType === "bought"
        ? "info-soft"
        : "secondary";
  const isResolvingSource = loadingSource || loadingFallbackSource;

  const handleOpenSourceProfile = () => {
    if (!effectiveSourceType || !effectiveSourceId) return;
    navigate(
      effectiveSourceType === "ngo"
        ? `/ngo/${effectiveSourceId}`
        : `/shop/${effectiveSourceId}`,
    );
  };

  const tabs = [
    {
      id: "overview",
      label: "Overview",
      icon: <UserIcon size={16} />,
    },
    {
      id: "medical",
      label: "Medical",
      icon: <ShieldCheck size={16} />,
    },
    {
      id: "source",
      label: "Source",
      icon: <Store size={16} />,
    },
    {
      id: "appointments",
      label: "Appointments",
      icon: <Calendar size={16} />,
    },
    {
      id: "reports",
      label: "Reports",
      icon: <ClipboardList size={16} />,
    },
  ];
  return (
    <div className={isMinimal ? styles.minimalContent : ""}>
      {!isMinimal && (
        <div className={styles.header}>
          <div className={styles.headerGrid}>
            <img
              src={
                pet.profileImage
                  ? `${BASE_URL}/uploads/pets/${pet.profileImage}`
                  : "https://pngimg.com/d/paw_PNG25.png"
              }
              alt={pet.name}
              className={styles.petImage}
            />
            <div className={styles.petInfo}>
              <div className={styles.nameSection}>
                <h1 className={styles.petName}>{pet.name}</h1>
                <div className={styles.idBadge}>
                  <Tag size={14} /> {pet.petId}
                </div>
              </div>
              <div className={styles.petBio}>
                <span className={styles.bioItem}>{pet.species}</span>
                <span className={styles.dot}>•</span>
                <span className={styles.bioItem}>{pet.breed}</span>
                <span className={styles.dot}>•</span>
                <span className={styles.bioItem}>{getAgeLabel()}</span>
                <span className={styles.dot}>•</span>
                <span className={styles.bioItem}>{pet.gender}</span>
                {pet.weight && (
                  <>
                    <span className={styles.dot}>•</span>
                    <span className={styles.bioItem}>{pet.weight} kg</span>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      <div
        className={`${styles.tabsContainer} ${isMinimal ? styles.minimalTabs : ""}`}
      >
        {tabs.map((tab) => (
          <Button
            key={tab.id}
            className={`${styles.tabBtn} ${activeTab === tab.id ? styles.activeTab : ""}`}
            onClick={() => setActiveTab(tab.id)}
            variant="ghost"
            size="sm"
          >
            {tab.icon}
            {tab.label}
          </Button>
        ))}
      </div>

      <div
        className={`${styles.content} ${isMinimal ? styles.minimalPadding : ""}`}
      >
        {activeTab === "overview" && (
          <div className={styles.tabContent}>
            <div className={styles.mainGrid}>
              <div className={styles.leftCol}>
                <section className={styles.section}>
                  <h3 className={styles.sectionTitle}>
                    <Activity size={16} /> General Details
                  </h3>
                  <div className={styles.detailGrid}>
                    <div className={styles.detailItem}>
                      <span className={styles.label}>Date of Birth</span>
                      <span className={styles.value}>
                        {pet.dob ? formatDate(pet.dob) : "N/A"}
                      </span>
                    </div>
                    <div className={styles.detailItem}>
                      <span className={styles.label}>Color / Marks</span>
                      <span className={styles.value}>
                        {pet.colorMarks || "N/A"}
                      </span>
                    </div>
                    {pet.identifiableMarks && (
                      <div className={styles.detailItem}>
                        <span className={styles.label}>Identifiable Marks</span>
                        <span className={styles.value}>
                          {pet.identifiableMarks}
                        </span>
                      </div>
                    )}
                    <div className={styles.detailItem}>
                      <span className={styles.label}>Status</span>
                      <span
                        className={`${styles.value} ${styles.status} ${styles[pet.status]}`}
                      >
                        {pet.status?.toUpperCase()}
                      </span>
                    </div>
                  </div>
                </section>
              </div>
              <div className={styles.rightCol}>
                <section className={styles.section}>
                  <h3 className={styles.sectionTitle}>
                    <UserIcon size={16} /> Owner Information
                  </h3>
                  <div className={styles.ownerCard}>
                    <img
                      src={getOwnerAvatarSrc()}
                      alt={pet.owner?.name}
                      className={styles.ownerAvatar}
                      onError={(e) => {
                        e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(pet.owner?.name || "Owner")}&background=E5E7EB&color=111827`;
                      }}
                    />
                    <div className={styles.ownerInfo}>
                      <h4 className={styles.ownerName}>{pet.owner?.name}</h4>
                      <p className={styles.ownerContact}>
                        <Mail size={12} /> {pet.owner?.email}
                      </p>
                      <p className={styles.ownerContact}>
                        <Phone size={12} /> {pet.owner?.phone}
                      </p>
                    </div>
                  </div>
                </section>
              </div>
            </div>
          </div>
        )}

        {activeTab === "medical" && (
          <div className={styles.tabContent}>
            <div className={`${styles.mainGrid} ${styles.medicalGrid}`}>
              <div className={styles.leftCol}>
                <section className={styles.section}>
                  <h3 className={styles.sectionTitle}>
                    <ShieldCheck size={16} /> Health & Medical
                  </h3>
                  <div className={styles.healthSection}>
                    <div className={styles.subsection}>
                      <label>Medical Conditions</label>
                      <div className={styles.tagWrapper}>
                        {medicalConditions.length > 0 ? (
                          medicalConditions.map((cond, i) => (
                            <span
                              key={i}
                              className={`${styles.tag} ${styles.condition}`}
                            >
                              <Activity size={12} />
                              {cond}
                            </span>
                          ))
                        ) : (
                          <EmptyState
                            compact
                            className={styles.inlineEmptyState}
                            icon={<Activity size={24} />}
                            title="No Records"
                            description="No medical conditions recorded"
                          />
                        )}
                      </div>
                    </div>
                    <div className={styles.subsection}>
                      <label>Allergies</label>
                      <div className={styles.tagWrapper}>
                        {allergies.length > 0 ? (
                          allergies.map((all, i) => (
                            <span
                              key={i}
                              className={`${styles.tag} ${styles.allergy}`}
                            >
                              <AlertCircle size={12} />
                              {all}
                            </span>
                          ))
                        ) : (
                          <EmptyState
                            compact
                            className={styles.inlineEmptyState}
                            icon={<AlertCircle size={24} />}
                            title="No Allergies"
                            description="No known allergies recorded"
                          />
                        )}
                      </div>
                    </div>
                  </div>
                </section>
              </div>
              <div className={styles.rightCol}>
                <section className={styles.section}>
                  <h3 className={styles.sectionTitle}>
                    <ShieldCheck size={16} /> Vaccinations
                  </h3>
                  <div className={styles.vaccinationList}>
                    {vaccinations.length > 0 ? (
                      vaccinations.map((vacc, i) => {
                        const vaccineStatus = getVaccStatus(vacc.nextDueDate);
                        return (
                          <div
                            key={vacc._id || i}
                            className={styles.vaccinationItem}
                          >
                            <div className={styles.vaccineHeader}>
                              <span className={styles.vaccineName}>
                                {vacc.name || "Unnamed Vaccine"}
                              </span>
                              {vaccineStatus && (
                                <span
                                  className={`${styles.vaccineStatus} ${styles[vaccineStatus.replace(" ", "")]}`}
                                >
                                  {vaccineStatus}
                                </span>
                              )}
                            </div>
                            <div className={styles.vaccineDetails}>
                              <span>Last: {formatDate(vacc.date)}</span>
                              {vacc.nextDueDate && (
                                <span>
                                  Next: {formatDate(vacc.nextDueDate)}
                                </span>
                              )}
                            </div>
                          </div>
                        );
                      })
                    ) : (
                      <EmptyState
                        compact
                        className={styles.inlineEmptyState}
                        icon={<ShieldCheck size={24} />}
                        title="No Vaccinations"
                        description="No vaccination history found"
                      />
                    )}
                  </div>
                </section>
              </div>
            </div>
          </div>
        )}

        {activeTab === "source" && (
          <div className={styles.tabContent}>
            <section className={styles.section}>
              <h3 className={styles.sectionTitle}>
                <Store size={16} /> Acquisition & Source
              </h3>
              <div className={styles.sourceCard}>
                <div className={styles.sourceHeaderRow}>
                  <div className={styles.sourceBadges}>
                    <Badge size="sm" variant={acquisitionBadgeVariant}>
                      {acquisitionLabel}
                    </Badge>
                    {effectiveSourceType && (
                      <Badge size="sm" variant="accent">
                        {sourceTypeLabel}
                      </Badge>
                    )}
                  </div>

                  {effectiveSourceType && effectiveSourceId && (
                    <Button
                      className={styles.sourceOpenBtn}
                      onClick={handleOpenSourceProfile}
                      variant="outline"
                      size="sm"
                    >
                      <ExternalLink size={14} /> Open {sourceTypeLabel} Profile
                    </Button>
                  )}
                </div>

                {isResolvingSource ? (
                  <p className={styles.empty}>Loading source details…</p>
                ) : effectiveSourceType ? (
                  <div className={styles.detailGrid}>
                    <div className={styles.detailItem}>
                      <span className={styles.label}>Source Name</span>
                      <span className={styles.value}>{sourceName}</span>
                    </div>
                    <div className={styles.detailItem}>
                      <span className={styles.label}>Source Type</span>
                      <span className={styles.value}>{sourceTypeLabel}</span>
                    </div>
                    <div className={styles.detailItem}>
                      <span className={styles.label}>Email</span>
                      <span className={styles.value}>{sourceEmail}</span>
                    </div>
                    <div className={styles.detailItem}>
                      <span className={styles.label}>Phone</span>
                      <span className={styles.value}>{sourcePhone}</span>
                    </div>
                    <div className={styles.detailItem}>
                      <span className={styles.label}>Address</span>
                      <span className={styles.value}>{sourceAddress}</span>
                    </div>
                  </div>
                ) : (
                  <p className={styles.empty}>
                    This pet was added manually, so no shop/NGO source is
                    linked.
                  </p>
                )}
              </div>
            </section>
          </div>
        )}

        {activeTab === "appointments" && (
          <div className={styles.tabContent}>
            <section className={styles.section}>
              <h3 className={styles.sectionTitle}>
                <Calendar size={16} /> Appointment History
              </h3>
              <PetAppointments petId={pet._id} />
            </section>
          </div>
        )}

        {activeTab === "reports" && (
          <div className={styles.tabContent}>
            <section className={styles.section}>
              <h3 className={styles.sectionTitle}>
                <ClipboardList size={16} /> Medical Reports
              </h3>
              <PetReports petId={pet._id} />
            </section>
          </div>
        )}
      </div>
    </div>
  );
};
const PetProfile = ({ petId: propPetId }) => {
  const { id: urlPetId } = useParams();
  const id = propPetId || urlPetId;
  const location = useLocation();
  const navigate = useNavigate();
  const handleBack = () => {
    if (location.state?.from) {
      navigate(location.state.from, {
        state: location.state,
      });
    } else if (window.history.length > 2) {
      navigate(-1);
    } else {
      navigate("/");
    }
  };
  return (
    <div className={`${styles.page} ${propPetId ? styles.modalMode : ""}`}>
      <div className={styles.container}>
        {!propPetId && (
          <Button
            className={styles.backBtn}
            onClick={handleBack}
            variant="ghost"
            size="sm"
          >
            <ArrowLeft size={18} /> Back
          </Button>
        )}

        <div className={styles.card}>
          <PetProfileContent petId={id} isMinimal={false} />
        </div>
      </div>
    </div>
  );
};
export { PetProfileContent };
export default PetProfile;

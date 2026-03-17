import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Pill,
  Download,
  ClipboardList,
  Calendar,
  ChevronRight,
  AlertTriangle,
  PawPrint,
  Syringe,
} from "lucide-react";
import toast from "react-hot-toast";
import styles from "../../appointments.module.css";
import FileViewerModal from "../../../../../common/fileViewer/FileViewerModal";
import { API_BASE_URL, BASE_URL } from "../../../../../../utils/constants";
import { Button, Modal } from "../../../../../common";
const ConsultationSummary = ({
  selectedAppt,
  isClientView,
  downloadPrescription,
  userRole,
  formatTime,
  profileTab,
  currentPage,
  filters,
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [viewFile, setViewFile] = useState(null);
  const [petProfile, setPetProfile] = useState(null);
  const [listingPet, setListingPet] = useState(null);
  const [loadingListingPet, setLoadingListingPet] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [isResolvingPetProfile, setIsResolvingPetProfile] = useState(false);
  const [selectedPrescription, setSelectedPrescription] = useState(null);
  useEffect(() => {
    setSelectedPrescription(null);
  }, [selectedAppt?._id]);
  const toIdString = (value) => {
    if (!value) return "";
    if (typeof value === "string") return value;
    if (typeof value === "object") {
      return value._id?.toString?.() || value.id?.toString?.() || "";
    }
    return "";
  };
  const displayAvatar =
    selectedAppt?.displayAvatar || selectedAppt?.providerAvatar;
  const petObjectFromAppointment =
    (selectedAppt?.petId && typeof selectedAppt.petId === "object"
      ? selectedAppt.petId
      : null) ||
    (selectedAppt?.pet && typeof selectedAppt.pet === "object"
      ? selectedAppt.pet
      : null);
  const petRef =
    selectedAppt?.resolvedPetId ||
    selectedAppt?.pet?._id ||
    selectedAppt?.petId?._id ||
    selectedAppt?.pet?.id ||
    selectedAppt?.petId?.id ||
    (typeof selectedAppt?.petId === "string" ? selectedAppt.petId : "") ||
    (typeof selectedAppt?.pet === "string" ? selectedAppt.pet : "");
  const normalizeText = (value) =>
    typeof value === "string" ? value.trim().toLowerCase() : "";
  const serviceRequestText = selectedAppt?.reason || "";
  const notesSourceText =
    selectedAppt?.service === "vet"
      ? selectedAppt?.doctorNotes || ""
      : selectedAppt?.serviceNotes || "";
  const normalizedService = (selectedAppt?.service || "").toLowerCase();
  const normalizedProviderType = (
    selectedAppt?.providerType || ""
  ).toLowerCase();
  const isRescueReport = normalizedService === "others";
  const isAdoptionAppointment =
    normalizedService === "pet_adoption" ||
    normalizedService === "adoption" ||
    normalizedProviderType === "ngo";
  const isShopAppointment =
    normalizedService === "shop" || normalizedProviderType === "shop";
  const hasDistinctServiceNotes =
    Boolean(normalizeText(notesSourceText)) &&
    normalizeText(notesSourceText) !== normalizeText(serviceRequestText);
  const showServiceNotesCard = hasDistinctServiceNotes;
  const requestedPet =
    isShopAppointment || isAdoptionAppointment || isRescueReport
      ? listingPet || petObjectFromAppointment
      : petProfile || petObjectFromAppointment;
  const requestedPetName = selectedAppt?.petName || requestedPet?.name || "N/A";
  const requestedPetType =
    selectedAppt?.petType ||
    selectedAppt?.petSpecies ||
    requestedPet?.type ||
    requestedPet?.species ||
    "N/A";
  const requestedPetBreed = requestedPet?.breed || selectedAppt?.petBreed || "";
  const requestedPetGenderRaw =
    requestedPet?.gender || selectedAppt?.petGender || "";
  const requestedPetGender = requestedPetGenderRaw
    ? requestedPetGenderRaw.charAt(0).toUpperCase() +
      requestedPetGenderRaw.slice(1)
    : "N/A";
  const requestedPetAge = getAgeLabel(
    requestedPet,
    selectedAppt?.petAge || selectedAppt?.age,
  );
  const scheduleDates = useMemo(() => {
    const rawDates =
      Array.isArray(selectedAppt?.selectedDates) &&
      selectedAppt.selectedDates.length > 0
        ? selectedAppt.selectedDates
        : selectedAppt?.date
          ? [selectedAppt.date]
          : [];

    return rawDates
      .map((dateValue) => new Date(dateValue))
      .filter((dateValue) => !Number.isNaN(dateValue.getTime()))
      .sort((left, right) => left.getTime() - right.getTime());
  }, [selectedAppt?.date, selectedAppt?.selectedDates]);
  const schedulePrimaryDate = scheduleDates[0] || null;
  const scheduleDatesCompactLabel = useMemo(() => {
    if (!scheduleDates.length) return "N/A";

    if (scheduleDates.length === 1) {
      return scheduleDates[0].toLocaleDateString("en-US", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });
    }

    const firstDate = scheduleDates[0];
    const sameMonthYear = scheduleDates.every(
      (dateValue) =>
        dateValue.getMonth() === firstDate.getMonth() &&
        dateValue.getFullYear() === firstDate.getFullYear(),
    );

    if (sameMonthYear) {
      const days = scheduleDates
        .map((dateValue) => dateValue.getDate())
        .join(",");
      const monthYear = firstDate.toLocaleDateString("en-US", {
        month: "short",
        year: "numeric",
      });
      return `${days} ${monthYear}`;
    }

    return scheduleDates
      .map((dateValue) =>
        dateValue.toLocaleDateString("en-US", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        }),
      )
      .join(", ");
  }, [scheduleDates]);
  const petDetailMeta = [
    requestedPetBreed ? { label: "Breed", value: requestedPetBreed } : null,
    requestedPetGender !== "N/A"
      ? { label: "Gender", value: requestedPetGender }
      : null,
    requestedPetAge !== "N/A" ? { label: "Age", value: requestedPetAge } : null,
  ].filter(Boolean);
  const petImagesSources = useMemo(() => {
    let images = [];
    if (selectedAppt?.petImages?.length > 0) {
      images = [...selectedAppt.petImages];
    } else if (requestedPet?.images?.length > 0) {
      images = [...requestedPet.images];
    }

    if (selectedAppt?.petImage) images.unshift(selectedAppt.petImage);
    if (selectedAppt?.petProfileImage)
      images.unshift(selectedAppt.petProfileImage);
    if (requestedPet?.profileImage) images.unshift(requestedPet.profileImage);
    if (requestedPet?.image) images.unshift(requestedPet.image);
    if (requestedPet?.avatar) images.unshift(requestedPet.avatar);

    return [...new Set(images.filter(Boolean))];
  }, [selectedAppt, requestedPet]);
  const showPetDetailsCard = Boolean(
    petRef ||
    selectedAppt?.petName ||
    selectedAppt?.petType ||
    listingPet?._id ||
    requestedPet?.name ||
    requestedPet?.species ||
    requestedPet?.type,
  );
  const listingPetId =
    toIdString(selectedAppt?.enquiryPetId) ||
    toIdString(listingPet?._id) ||
    ((petObjectFromAppointment?.shopId || petObjectFromAppointment?.ngoId) &&
    petObjectFromAppointment?._id
      ? toIdString(petObjectFromAppointment._id)
      : "");
  const appointmentUserPetId =
    toIdString(selectedAppt?.resolvedPetId) ||
    toIdString(selectedAppt?.pet?._id) ||
    toIdString(selectedAppt?.petId?._id) ||
    (typeof selectedAppt?.petId === "string" ? selectedAppt.petId : "") ||
    toIdString(petProfile?._id);
  const appointmentPetId =
    isShopAppointment || isAdoptionAppointment
      ? listingPetId
      : appointmentUserPetId;
  const getPetImageUrl = (imageValue) => {
    let normalizedImage = imageValue;
    if (normalizedImage && typeof normalizedImage === "object") {
      normalizedImage =
        normalizedImage.url ||
        normalizedImage.path ||
        normalizedImage.image ||
        normalizedImage.src ||
        "";
    }
    if (!normalizedImage || typeof normalizedImage !== "string") return "";
    if (/^https?:\/\//i.test(normalizedImage)) return normalizedImage;
    const normalized = normalizedImage.replace(/^\/+/, "");
    if (normalized.startsWith("uploads/")) return `${BASE_URL}/${normalized}`;
    if (normalized.startsWith("pets/"))
      return `${BASE_URL}/uploads/${normalized}`;
    if (normalized.startsWith("appointments/")) {
      return `${BASE_URL}/uploads/${normalized}`;
    }
    return `${BASE_URL}/uploads/pets/${normalized}`;
  };
  const petImageUrls = petImagesSources.map(getPetImageUrl).filter(Boolean);
  const primaryPetImageUrl = petImageUrls[0] || "";
  useEffect(() => {
    let isMounted = true;
    const fetchHistory = async () => {
      if (
        !selectedAppt ||
        !petRef ||
        isShopAppointment ||
        isAdoptionAppointment ||
        isRescueReport
      ) {
        if (isMounted) {
          setPetProfile(null);
          setLoadingHistory(false);
        }
        return;
      }
      setLoadingHistory(true);
      try {
        const token =
          localStorage.getItem("token") || sessionStorage.getItem("token");
        if (!token) {
          if (isMounted) {
            setPetProfile(null);
          }
          return;
        }
        const res = await fetch(
          `${API_BASE_URL}/appointments/pet-history/${encodeURIComponent(petRef)}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );
        if (!res.ok) {
          if (isMounted) {
            setPetProfile(null);
          }
          return;
        }
        const data = await res.json();
        const resolvedPet =
          data?.pet ||
          data?.petProfile ||
          data?.data?.pet ||
          (data?.data && typeof data.data === "object" ? data.data : null);
        if (isMounted) {
          setPetProfile(
            resolvedPet && typeof resolvedPet === "object" ? resolvedPet : null,
          );
        }
      } catch {
        if (isMounted) {
          setPetProfile(null);
        }
      } finally {
        if (isMounted) {
          setLoadingHistory(false);
        }
      }
    };
    fetchHistory();
    return () => {
      isMounted = false;
    };
  }, [selectedAppt, petRef, isShopAppointment, isAdoptionAppointment]);

  useEffect(() => {
    let isMounted = true;
    const fetchListingPet = async () => {
      if (
        !selectedAppt ||
        (!isShopAppointment && !isAdoptionAppointment && !isRescueReport)
      ) {
        if (isMounted) {
          setListingPet(null);
          setLoadingListingPet(false);
        }
        return;
      }

      setLoadingListingPet(true);

      try {
        let resolvedPet = null;
        const explicitPetId =
          toIdString(selectedAppt?.enquiryPetId) ||
          (petObjectFromAppointment?.shopId || petObjectFromAppointment?.ngoId
            ? toIdString(petObjectFromAppointment?._id)
            : "");

        if (explicitPetId) {
          const petRes = await fetch(
            `${API_BASE_URL}/pets/${encodeURIComponent(explicitPetId)}?populate=shopId&populate=ngoId`,
          );
          if (petRes.ok) {
            const petData = await petRes.json();
            resolvedPet = petData?.pet || petData?.data || petData;
          }
        }

        if (!resolvedPet) {
          const listRes = await fetch(
            `${API_BASE_URL}/pets?populate=shopId&populate=ngoId`,
          );
          if (listRes.ok) {
            const listData = await listRes.json();
            const allPets = Array.isArray(listData?.pets)
              ? listData.pets
              : Array.isArray(listData?.data)
                ? listData.data
                : Array.isArray(listData)
                  ? listData
                  : [];

            const providerIdValue = toIdString(selectedAppt?.providerId);
            const targetName = normalizeText(
              selectedAppt?.petName || petObjectFromAppointment?.name || "",
            );
            const targetType = normalizeText(
              selectedAppt?.petType ||
                petObjectFromAppointment?.type ||
                petObjectFromAppointment?.species ||
                "",
            );

            const belongsToProvider = (pet) => {
              const ownerRef = isAdoptionAppointment ? pet?.ngoId : pet?.shopId;
              const ownerId = toIdString(ownerRef);
              return providerIdValue ? ownerId === providerIdValue : true;
            };

            resolvedPet =
              allPets.find(
                (pet) =>
                  belongsToProvider(pet) &&
                  normalizeText(pet?.name) === targetName &&
                  (!targetType ||
                    normalizeText(pet?.type || pet?.species) === targetType),
              ) ||
              allPets.find(
                (pet) =>
                  belongsToProvider(pet) &&
                  normalizeText(pet?.name) === targetName,
              ) ||
              allPets.find(
                (pet) =>
                  belongsToProvider(pet) &&
                  targetName &&
                  normalizeText(pet?.name).includes(targetName),
              ) ||
              null;
          }
        }

        if (!resolvedPet) {
          const providerIdValue = toIdString(selectedAppt?.providerId);
          if (providerIdValue) {
            const providerEndpoint = isAdoptionAppointment
              ? `${API_BASE_URL}/pets/ngo/${encodeURIComponent(providerIdValue)}`
              : `${API_BASE_URL}/pets/shop/${encodeURIComponent(providerIdValue)}`;
            const providerRes = await fetch(providerEndpoint);
            if (providerRes.ok) {
              const providerData = await providerRes.json();
              const providerPets = Array.isArray(providerData?.pets)
                ? providerData.pets
                : Array.isArray(providerData?.data)
                  ? providerData.data
                  : Array.isArray(providerData)
                    ? providerData
                    : [];
              const targetName = normalizeText(
                selectedAppt?.petName || petObjectFromAppointment?.name || "",
              );
              const targetType = normalizeText(
                selectedAppt?.petType ||
                  petObjectFromAppointment?.type ||
                  petObjectFromAppointment?.species ||
                  "",
              );
              resolvedPet =
                providerPets.find(
                  (pet) =>
                    normalizeText(pet?.name) === targetName &&
                    (!targetType ||
                      normalizeText(pet?.type || pet?.species) === targetType),
                ) ||
                providerPets.find(
                  (pet) => normalizeText(pet?.name) === targetName,
                ) ||
                providerPets.find(
                  (pet) =>
                    targetName && normalizeText(pet?.name).includes(targetName),
                ) ||
                null;
            }
          }
        }

        if (isMounted) {
          setListingPet(
            resolvedPet && typeof resolvedPet === "object" ? resolvedPet : null,
          );
        }
      } catch {
        if (isMounted) {
          setListingPet(null);
        }
      } finally {
        if (isMounted) {
          setLoadingListingPet(false);
        }
      }
    };

    fetchListingPet();
    return () => {
      isMounted = false;
    };
  }, [
    selectedAppt,
    isShopAppointment,
    isAdoptionAppointment,
    petObjectFromAppointment,
  ]);
  function getAgeLabel(pet, fallbackAge) {
    if (fallbackAge || fallbackAge === 0) {
      if (typeof fallbackAge === "number") return `${fallbackAge} Years`;
      if (typeof fallbackAge === "string" && fallbackAge.trim()) {
        const normalizedAge = fallbackAge.trim();
        if (/^(n\/?a|na|unknown)$/i.test(normalizedAge)) return "N/A";
        if (/(year|month|week|day)/i.test(normalizedAge)) {
          return normalizedAge;
        }
        return `${normalizedAge} Years`;
      }
    }
    if (!pet) return "N/A";
    if (pet.age) return `${pet.age} Years`;
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
  }
  const prescriptionEntries = useMemo(() => {
    if (!selectedAppt?.prescription) return [];

    let parsedValue = selectedAppt.prescription;
    if (typeof parsedValue === "string") {
      const trimmedValue = parsedValue.trim();
      if (!trimmedValue) return [];
      try {
        parsedValue = JSON.parse(trimmedValue);
      } catch {
        parsedValue = trimmedValue;
      }
    }

    const rawList = Array.isArray(parsedValue) ? parsedValue : [parsedValue];
    return rawList
      .map((entry, index) => {
        if (entry && typeof entry === "object") {
          const medication =
            entry.medication ||
            entry.medicine ||
            entry.name ||
            entry.drug ||
            `Prescription ${index + 1}`;
          return {
            key: `${index}-${String(medication)}`,
            medication: String(medication),
            dosage: entry.dosage || entry.dose || "",
            duration: entry.duration || "",
            frequency: entry.frequency || "",
            timing: entry.timing || entry.schedule || "",
            instructions:
              entry.instructions ||
              entry.instruction ||
              entry.notes ||
              entry.note ||
              "",
          };
        }

        const medication = String(entry ?? "").trim();
        if (!medication) return null;
        return {
          key: `${index}-${medication}`,
          medication,
          dosage: "",
          duration: "",
          frequency: "",
          timing: "",
          instructions: "",
        };
      })
      .filter(Boolean);
  }, [selectedAppt?.prescription]);
  if (!selectedAppt) return null;
  const openPetProfile = async () => {
    if (!selectedAppt?._id && !appointmentPetId) {
      toast.error("Pet profile cannot be opened for this appointment.");
      return;
    }

    if (isShopAppointment || isAdoptionAppointment) {
      if (!appointmentPetId) {
        toast.error("Pet details are not available for this appointment.");
        return;
      }
      navigate(
        isAdoptionAppointment
          ? `/adopt-pets/${appointmentPetId}`
          : `/shop-pets/${appointmentPetId}`,
        {
          state: {
            from: location.pathname + location.search,
            appointmentId: selectedAppt._id,
            activeTab: profileTab || "appointments",
            restoreAppt: true,
            currentPage,
            filters,
          },
        },
      );
      return;
    }

    if (petRef && typeof petRef === "string") {
      navigate(`/user-pet/${petRef}`, {
        state: {
          from: location.pathname + location.search,
          appointmentId: selectedAppt._id,
          activeTab: profileTab || "appointments",
          restoreAppt: true,
          currentPage,
          filters,
        },
      });
      return;
    }

    try {
      setIsResolvingPetProfile(true);
      const token =
        localStorage.getItem("token") || sessionStorage.getItem("token");
      if (!token) {
        toast.error("Please login again.");
        return;
      }
      const response = await fetch(
        `${API_BASE_URL}/appointments/${selectedAppt._id}/ensure-pet-profile`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );
      const data = await response.json();
      if (!response.ok || !data?.petId) {
        toast.error(data?.message || "Unable to open pet profile.");
        return;
      }
      navigate(`/user-pet/${data.petId}`, {
        state: {
          from: location.pathname + location.search,
          appointmentId: selectedAppt._id,
          activeTab: profileTab || "appointments",
          restoreAppt: true,
          currentPage,
          filters,
        },
      });
    } catch {
      toast.error("Unable to open pet profile right now.");
    } finally {
      setIsResolvingPetProfile(false);
    }
  };
  return (
    <>
      <div className={styles.appointmentDetails}>
        {/* Card 1: Header Section */}
        <div className={styles.headerCard}>
          <div className={styles.headerTop}>
            <div className={styles.headerProviderInfo}>
              <img
                src={displayAvatar}
                alt="Avatar"
                className={styles.headerAvatar}
                onError={(e) => {
                  e.target.src = "https://via.placeholder.com/150";
                }}
              />
              <div>
                <h4 className={styles.headerName}>
                  {isClientView
                    ? selectedAppt.providerName
                    : selectedAppt.userName || selectedAppt.user?.name}
                </h4>
                <p className={styles.headerSpec}>
                  {isClientView
                    ? selectedAppt.providerSpec
                    : `Pet: ${selectedAppt.petName || selectedAppt.petId?.name}`}
                </p>
              </div>
            </div>

            {selectedAppt.status === "completed" && (
              <Button
                onClick={() => downloadPrescription(selectedAppt)}
                className={styles.downloadReceiptBtn}
                variant="primary"
                size="md"
              >
                <Download size={16} />
                {selectedAppt.service === "vet" && selectedAppt.prescription
                  ? "Download Receipt"
                  : "Download Receipt"}
              </Button>
            )}
          </div>

          <div className={styles.headerDivider}></div>

          <div className={styles.headerMeta}>
            <div className={styles.metaItem}>
              <span className={styles.metaLabel}>Visit Date</span>
              <span className={styles.metaValue}>
                {scheduleDates.length > 1
                  ? scheduleDatesCompactLabel
                  : schedulePrimaryDate
                    ? schedulePrimaryDate.toLocaleDateString("en-US", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })
                    : "N/A"}
              </span>
            </div>
            <div className={styles.metaDividerVertical}></div>
            <div className={styles.metaItem}>
              <span className={styles.metaLabel}>Time Slot</span>
              <span className={styles.metaValue}>
                {formatTime(selectedAppt.time)}
              </span>
            </div>
            <div className={styles.metaDividerVertical}></div>
            <div className={styles.metaItem}>
              <span className={styles.metaLabel}>Ref ID</span>
              <span className={styles.metaValue}>
                #{selectedAppt._id?.slice(-6).toUpperCase()}
              </span>
            </div>
          </div>
        </div>

        {/* Content Grid */}
        <div className={styles.contentGrid}>
          {/* Left Column: Notes & Follow-up */}
          <div className={styles.leftColumn}>
            <div className={styles.contentCard}>
              <div className={styles.cardHeader}>
                <ClipboardList size={20} />
                <h3>
                  {selectedAppt.service === "vet"
                    ? "Reason for Visit"
                    : "Service Request"}
                </h3>
              </div>
              <div className={styles.cardBodyBox}>
                <p className={styles.notesText}>
                  {serviceRequestText || "No request details available."}
                </p>
                {scheduleDates.length > 1 && (
                  <p className={styles.auxText}>
                    Requested service on: {scheduleDatesCompactLabel}
                  </p>
                )}
                {selectedAppt.healthIssues && (
                  <p className={styles.auxText}>
                    Health issues: {selectedAppt.healthIssues}
                  </p>
                )}
              </div>
            </div>

            {/* Clinical / Service Notes Card */}
            {showServiceNotesCard && (
              <div className={styles.contentCard}>
                <div className={styles.cardHeader}>
                  <ClipboardList size={20} />
                  <h3>
                    {selectedAppt.service === "vet"
                      ? "Clinical Notes"
                      : "Service Notes"}
                  </h3>
                </div>
                <div className={styles.cardBodyBox}>
                  <p className={styles.notesText}>
                    {selectedAppt.service === "vet"
                      ? notesSourceText || "No clinical notes available."
                      : notesSourceText || "No service notes available."}
                  </p>
                </div>
              </div>
            )}

            {selectedAppt.status === "cancelled" && (
              <div className={styles.contentCard}>
                <div className={styles.cardHeader}>
                  <AlertTriangle size={20} />
                  <h3>Cancellation Details</h3>
                </div>
                <div className={styles.cardBodyBox}>
                  <p className={styles.auxText}>
                    <strong>Cancelled by:</strong>{" "}
                    {selectedAppt.cancelledBy === "user" ? "User" : "Provider"}
                  </p>
                  {selectedAppt.cancellationReason && (
                    <p
                      className={styles.notesText}
                      style={{ marginTop: "8px" }}
                    >
                      <strong>Reason:</strong> {selectedAppt.cancellationReason}
                    </p>
                  )}
                </div>
              </div>
            )}

            {selectedAppt.service === "vet" && (
              <div className={styles.contentCard}>
                <div className={styles.cardHeader}>
                  <Pill size={20} />
                  <h3>Prescriptions</h3>
                </div>
                <div className={styles.prescriptionList}>
                  {prescriptionEntries.length > 0 ? (
                    prescriptionEntries.map((prescription) => (
                      <button
                        type="button"
                        key={prescription.key}
                        className={`${styles.prescriptionItem} ${styles.prescriptionTrigger}`}
                        onClick={() => setSelectedPrescription(prescription)}
                      >
                        <div className={styles.pillIcon}>
                          <Pill size={14} />
                        </div>
                        <div className={styles.prescDetails}>
                          <span className={styles.medName}>
                            {prescription.medication}
                          </span>
                          {(prescription.dosage || prescription.duration) && (
                            <span className={styles.medMeta}>
                              {prescription.dosage && `${prescription.dosage}`}
                              {prescription.dosage &&
                                prescription.duration &&
                                " • "}
                              {prescription.duration &&
                                `${prescription.duration}`}
                            </span>
                          )}
                        </div>
                        <ChevronRight size={16} className={styles.arrowIcon} />
                      </button>
                    ))
                  ) : (
                    <p className={styles.noDataText}>None prescribed.</p>
                  )}
                </div>
              </div>
            )}

            {selectedAppt.service === "vet" &&
              selectedAppt.vaccinations &&
              selectedAppt.vaccinations.length > 0 && (
                <div className={styles.contentCard}>
                  <div className={styles.cardHeader}>
                    <Syringe size={20} />
                    <h3>Vaccinations</h3>
                  </div>
                  <div className={styles.prescriptionList}>
                    {selectedAppt.vaccinations.map((vaccination, idx) => (
                      <div
                        key={idx}
                        className={`${styles.prescriptionItem} ${styles.prescriptionTrigger}`}
                      >
                        <div className={styles.pillIcon}>
                          <Syringe size={14} />
                        </div>
                        <div className={styles.prescDetails}>
                          <span className={styles.medName}>
                            {vaccination.name}
                          </span>
                          <span className={styles.medMeta}>
                            Vaccination Date:{" "}
                            {vaccination.date
                              ? new Date(vaccination.date).toLocaleDateString()
                              : "N/A"}
                            {vaccination.nextDueDate &&
                              ` • Next Due: ${new Date(vaccination.nextDueDate).toLocaleDateString()}`}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            {selectedAppt.service === "vet" && (
              <div className={styles.contentCard}>
                <div className={styles.cardHeader}>
                  <ClipboardList size={20} />
                  <h3>Reports</h3>
                </div>
                <div className={styles.reportList}>
                  {selectedAppt.report ? (
                    <div className={styles.reportItem}>
                      <div className={styles.reportRow}>
                        <span className={styles.reportName}>
                          Medical Report
                        </span>
                        <Button
                          onClick={() =>
                            setViewFile({
                              file: {
                                url: selectedAppt.report.startsWith("http")
                                  ? selectedAppt.report
                                  : `uploads/reports/${selectedAppt.report}`,
                                fileName: "Medical Report",
                                fileType: selectedAppt.report
                                  .toLowerCase()
                                  .endsWith(".pdf")
                                  ? "pdf"
                                  : "image",
                              },
                            })
                          }
                          variant="outline"
                          size="sm"
                        >
                          View
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <p className={styles.noDataText}>No records found.</p>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Pet Showcase */}
          <div className={styles.rightColumn}>
            {showPetDetailsCard && (
              <div
                className={`${styles.contentCard} ${styles.petShowcaseCard}`}
              >
                <div className={styles.cardHeader}>
                  <PawPrint size={20} />
                  <h3>Pet Details</h3>
                </div>
                <div className={styles.petShowcaseBody}>
                  <div className={styles.petShowcaseMedia}>
                    {petImageUrls.length > 1 ? (
                      <div className={styles.petImagesGallery}>
                        {petImageUrls.map((url, idx) => (
                          <img
                            key={idx}
                            src={url}
                            alt={`${requestedPetName} ${idx + 1}`}
                            className={styles.petShowcaseImageThumb}
                            onClick={() =>
                              setViewFile({
                                file: {
                                  url,
                                  fileName: `${requestedPetName} ${idx + 1}`,
                                  fileType: "image",
                                },
                              })
                            }
                            onError={(e) => {
                              e.target.style.display = "none";
                            }}
                          />
                        ))}
                      </div>
                    ) : primaryPetImageUrl ? (
                      <img
                        src={primaryPetImageUrl}
                        alt={requestedPetName}
                        className={styles.petShowcaseImage}
                        onError={(e) => {
                          e.target.src =
                            "https://via.placeholder.com/400x220?text=Pet";
                        }}
                      />
                    ) : (
                      <div className={styles.petShowcaseFallback}>
                        No pet image
                      </div>
                    )}
                  </div>
                  <div className={styles.petShowcaseInfo}>
                    {loadingListingPet ||
                    (!isShopAppointment &&
                      !isAdoptionAppointment &&
                      loadingHistory) ? (
                      <p className={styles.noDataText}>Loading pet details…</p>
                    ) : (
                      <>
                        <p className={styles.petShowcaseTitle}>
                          {requestedPetName}
                          <span className={styles.petShowcaseType}>
                            ({requestedPetType})
                          </span>
                        </p>
                        {petDetailMeta.length > 0 && (
                          <div className={styles.petMetaGrid}>
                            {petDetailMeta.map((item, index) => (
                              <div key={index} className={styles.petMetaItem}>
                                <span className={styles.petMetaLabel}>
                                  {item.label}:
                                </span>
                                <span className={styles.petMetaValue}>
                                  {item.value || "N/A"}
                                </span>
                              </div>
                            ))}
                          </div>
                        )}
                        {!isRescueReport && (
                          <div className={styles.petCardActions}>
                            <Button
                              onClick={openPetProfile}
                              disabled={
                                isResolvingPetProfile ||
                                ((isShopAppointment || isAdoptionAppointment) &&
                                  loadingListingPet)
                              }
                              variant="primary"
                              size="sm"
                            >
                              {isResolvingPetProfile
                                ? "Opening..."
                                : "View Pet Details"}
                            </Button>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Follow-up Card */}
            {selectedAppt.service === "vet" && selectedAppt.followUpDate && (
              <div className={styles.contentCard}>
                <div className={styles.cardHeader}>
                  <Calendar size={20} />
                  <h3>Follow-up Instructions</h3>
                </div>
                <div className={styles.cardBodyBox}>
                  <p className={styles.notesText}>
                    Review with reports on{" "}
                    {new Date(selectedAppt.followUpDate).toLocaleDateString(
                      "en-US",
                      {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      },
                    )}
                  </p>
                </div>
              </div>
            )}

            {/* Diagnosis Card */}
            {selectedAppt.service === "vet" && selectedAppt.diagnosis && (
              <div className={styles.contentCard}>
                <div className={styles.cardHeader}>
                  <ClipboardList size={20} />
                  <h3>Diagnosis</h3>
                </div>
                <div className={styles.cardBodyBox}>
                  <p className={styles.notesText}>{selectedAppt.diagnosis}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      {viewFile && (
        <FileViewerModal file={viewFile} onClose={() => setViewFile(null)} />
      )}
      <Modal
        isOpen={Boolean(selectedPrescription)}
        onClose={() => setSelectedPrescription(null)}
        title="Prescription Details"
        size="md"
        footer={
          <div className={styles.prescriptionModalFooterActions}>
            <Button
              onClick={() => setSelectedPrescription(null)}
              variant="primary"
              size="md"
            >
              Close
            </Button>
          </div>
        }
      >
        {selectedPrescription && (
          <div className={styles.prescriptionDetailModal}>
            <div className={styles.prescriptionDetailHeader}>
              <div className={styles.prescriptionDetailIcon}>
                <Pill size={16} />
              </div>
              <div>
                <p className={styles.prescriptionDetailLabel}>Medication</p>
                <p className={styles.prescriptionDetailTitle}>
                  {selectedPrescription.medication}
                </p>
              </div>
            </div>

            <div className={styles.prescriptionDetailGrid}>
              <div className={styles.prescriptionDetailField}>
                <span className={styles.prescriptionFieldLabel}>Dosage</span>
                <span className={styles.prescriptionFieldValue}>
                  {selectedPrescription.dosage || "Not specified"}
                </span>
              </div>
              <div className={styles.prescriptionDetailField}>
                <span className={styles.prescriptionFieldLabel}>Duration</span>
                <span className={styles.prescriptionFieldValue}>
                  {selectedPrescription.duration || "Not specified"}
                </span>
              </div>
              <div className={styles.prescriptionDetailField}>
                <span className={styles.prescriptionFieldLabel}>Frequency</span>
                <span className={styles.prescriptionFieldValue}>
                  {selectedPrescription.frequency || "Not specified"}
                </span>
              </div>
              <div className={styles.prescriptionDetailField}>
                <span className={styles.prescriptionFieldLabel}>Timing</span>
                <span className={styles.prescriptionFieldValue}>
                  {selectedPrescription.timing || "Not specified"}
                </span>
              </div>
            </div>

            <div className={styles.prescriptionInstructions}>
              <span className={styles.prescriptionFieldLabel}>
                Instructions
              </span>
              <p className={styles.prescriptionInstructionsText}>
                {selectedPrescription.instructions ||
                  "No instructions provided."}
              </p>
            </div>
          </div>
        )}
      </Modal>
    </>
  );
};
export default ConsultationSummary;

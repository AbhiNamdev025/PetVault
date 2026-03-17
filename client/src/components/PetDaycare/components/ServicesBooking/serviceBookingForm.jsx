import React, { useCallback, useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import styles from "./serviceBookingForm.module.css";
import { API_BASE_URL, BASE_URL } from "../../../../utils/constants";
import { fetchPlatformFeeConfig } from "../../../../utils/platformFee";
import { AppointmentFlow, toDisplayDate } from "../../../common";
import useBookingPricing from "../../../Appointments/BookAppointmentModal/hooks/useBookingPricing";
import {
  buildProviderTimeGroups,
  normalizeTimeTo24h,
} from "../../../Appointments/BookAppointmentModal/utils/bookingFlow.utils";
import ConfirmationModal from "../../../ConfirmationModal/ConfirmationModal";
import {
  buildAllowedWeekdaySet,
  getWeekdayTokenFromDate,
} from "../../../../utils/weekday";
import {
  BOOKING_STEPS,
  BOOKING_WINDOW_DAYS,
  MAX_DAYCARE_SELECTED_DAYS,
  DEFAULT_PROVIDER_IMAGE,
  VALID_PROVIDER_TYPES,
} from "./serviceBooking.constants";
import {
  buildDateRangeInclusive,
  getStoredUserPhone,
  isOtherPetType,
  normalizePetType,
  resolveProviderEndpoint,
  resolveProviderMeta,
  resolveProviderName,
  sortDateAsc,
  toDateInput,
} from "./serviceBooking.utils";
import {
  DetailsStep,
  ProviderSummaryCard,
  ReviewStep,
  ScheduleStep,
  SuccessStep,
} from "./components";
import { scrollAppToTop } from "../../../../utils/scroll";
import loadRazorpay from "../../../../utils/loadRazorpay";

const ServiceBookingForm = ({
  defaultService = "",
  providerId = "",
  providerType = "caretaker",
  enableMultipleDates = true,
  onStepChange,
  onClose,
}) => {
  const storedUserPhone = useMemo(() => getStoredUserPhone(), []);
  const normalizedProviderType = useMemo(() => {
    const normalized = String(providerType || "")
      .trim()
      .toLowerCase();
    if (normalized === "daycare") return "caretaker";
    return VALID_PROVIDER_TYPES.has(normalized) ? normalized : "caretaker";
  }, [providerType]);
  const initialFormData = useMemo(
    () => ({
      providerType: normalizedProviderType,
      providerId,
      service: defaultService || "daycare",
      petName: "",
      petType: "",
      otherPetType: "",
      addToMyPets: false,
      parentPhone: storedUserPhone,
      time: "",
      reason: "",
      healthIssues: "",
    }),
    [normalizedProviderType, providerId, defaultService, storedUserPhone],
  );

  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [provider, setProvider] = useState(null);
  const [isLoadingProvider, setIsLoadingProvider] = useState(false);
  const [userPets, setUserPets] = useState([]);
  const [selectedPetId, setSelectedPetId] = useState("");
  const [petImageFiles, setPetImageFiles] = useState([]);
  const [previewPetImages, setPreviewPetImages] = useState([]);
  const [bookedAppointments, setBookedAppointments] = useState([]);
  const [failedBookings, setFailedBookings] = useState([]);
  const [showLeaveConfirm, setShowLeaveConfirm] = useState(false);
  const [dateMode, setDateMode] = useState("single");
  const [activeDate, setActiveDate] = useState("");
  const [rangeAnchorDate, setRangeAnchorDate] = useState("");
  const [selectedDates, setSelectedDates] = useState([]);
  const [bookedSlotsByDate, setBookedSlotsByDate] = useState({});
  const [blockedDatesByDate, setBlockedDatesByDate] = useState({});
  const [isLoadingSlots, setIsLoadingSlots] = useState(false);
  const [platformConfig, setPlatformConfig] = useState(null);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState("Cash");
  const [formData, setFormData] = useState(() => ({
    ...initialFormData,
  }));
  const billingUnits = useMemo(() => {
    if (normalizedProviderType !== "caretaker") return 1;
    if (!enableMultipleDates || dateMode !== "multiple") return 1;
    const uniqueDatesCount = new Set(
      selectedDates.filter((dateValue) => Boolean(dateValue)),
    ).size;
    return Math.max(1, uniqueDatesCount);
  }, [dateMode, enableMultipleDates, normalizedProviderType, selectedDates]);
  const supportsOnlinePayment = useMemo(
    () => ["caretaker", "doctor", "daycare"].includes(normalizedProviderType),
    [normalizedProviderType],
  );
  const isFullDayCaretakerBooking = useMemo(
    () => normalizedProviderType === "caretaker",
    [normalizedProviderType],
  );
  const shouldBlockDateOnConfirmed = useMemo(
    () => normalizedProviderType === "caretaker",
    [normalizedProviderType],
  );

  const {
    coinBalance,
    coinRate,
    coinsToUse,
    setCoinsToUse,
    feePercent,
    platformFee,
    totalPayable,
    maxCoins,
    coinDiscount,
    providerFee,
    finalPayable,
    unitProviderFee,
  } = useBookingPricing({
    provider,
    providerType: normalizedProviderType,
    platformConfig,
    billingUnits,
  });

  useEffect(() => {
    setFormData((previous) => ({
      ...previous,
      providerType: normalizedProviderType,
      providerId,
      service: defaultService || previous.service || "daycare",
      parentPhone: previous.parentPhone || storedUserPhone,
    }));
  }, [defaultService, providerId, normalizedProviderType, storedUserPhone]);
  useEffect(() => {
    if (!supportsOnlinePayment && selectedPaymentMethod !== "Cash") {
      setSelectedPaymentMethod("Cash");
    }
  }, [selectedPaymentMethod, supportsOnlinePayment]);

  useEffect(() => {
    if (enableMultipleDates) return;
    setDateMode("single");
    setRangeAnchorDate("");
    setSelectedDates((previous) => {
      if (activeDate) return [activeDate];
      return previous.length > 0 ? [previous[0]] : [];
    });
  }, [enableMultipleDates, activeDate]);

  useEffect(() => {
    let ignore = false;

    const fetchProvider = async () => {
      if (!providerId) {
        setProvider(null);
        return;
      }

      const endpoint = resolveProviderEndpoint(
        normalizedProviderType,
        providerId,
      );
      if (!endpoint) {
        setProvider(null);
        return;
      }

      try {
        setIsLoadingProvider(true);
        const response = await fetch(endpoint);
        if (!response.ok) throw new Error("Failed to load provider");
        const data = await response.json();
        if (!ignore) setProvider(data);
      } catch {
        if (!ignore) setProvider(null);
      } finally {
        if (!ignore) setIsLoadingProvider(false);
      }
    };

    fetchProvider();
    return () => {
      ignore = true;
    };
  }, [providerId, normalizedProviderType]);

  useEffect(() => {
    const fetchUserPets = async () => {
      try {
        const token =
          localStorage.getItem("token") || sessionStorage.getItem("token");
        if (!token) return;

        const response = await fetch(`${API_BASE_URL}/user-pets`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (!response.ok) return;

        const data = await response.json();
        setUserPets(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Error fetching user pets", error);
      }
    };

    fetchUserPets();
  }, []);

  useEffect(() => {
    let ignore = false;

    fetchPlatformFeeConfig()
      .then((config) => {
        if (!ignore) setPlatformConfig(config);
      })
      .catch(() => {
        if (!ignore) setPlatformConfig(null);
      });

    return () => {
      ignore = true;
    };
  }, []);

  useEffect(() => {
    return () => {
      previewPetImages.forEach((url) => {
        if (typeof url === "string" && url.startsWith("blob:")) {
          URL.revokeObjectURL(url);
        }
      });
    };
  }, [previewPetImages]);

  const providerName = useMemo(
    () => resolveProviderName(provider, normalizedProviderType),
    [provider, normalizedProviderType],
  );

  const providerMeta = useMemo(
    () => resolveProviderMeta(provider, normalizedProviderType),
    [provider, normalizedProviderType],
  );

  const providerImage = useMemo(() => {
    if (provider?.avatar) {
      return `${BASE_URL}/uploads/avatars/${provider.avatar}`;
    }
    return DEFAULT_PROVIDER_IMAGE;
  }, [provider?.avatar]);

  const providerDays = useMemo(
    () =>
      Array.isArray(provider?.availability?.days)
        ? provider.availability.days
        : [],
    [provider?.availability?.days],
  );
  const providerAllowedDaySet = useMemo(
    () => buildAllowedWeekdaySet(providerDays),
    [providerDays],
  );

  const providerTimeGroups = useMemo(() => {
    if (provider?.availability?.available === false) return [];

    return (
      buildProviderTimeGroups(
        provider?.availability?.startTime,
        provider?.availability?.endTime,
      ) || undefined
    );
  }, [
    provider?.availability?.available,
    provider?.availability?.startTime,
    provider?.availability?.endTime,
  ]);

  const blockedDates = useMemo(
    () =>
      Object.entries(blockedDatesByDate)
        .filter(([, isBlocked]) => Boolean(isBlocked))
        .map(([dateValue]) => dateValue),
    [blockedDatesByDate],
  );

  const fetchBookedSlotsForDate = useCallback(
    async (targetDate) => {
      if (!providerId || !targetDate) {
        return { slots: [], isDateBlocked: false };
      }

      const token =
        localStorage.getItem("token") || sessionStorage.getItem("token");
      if (!token) {
        return { slots: [], isDateBlocked: false };
      }

      try {
        const response = await fetch(
          `${API_BASE_URL}/appointments/booked-slots?providerId=${providerId}&date=${targetDate}&t=${Date.now()}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );

        if (!response.ok) {
          return { slots: [], isDateBlocked: false };
        }

        const data = await response.json();
        const slots = Array.isArray(data?.slots)
          ? data.slots.map((slot) => normalizeTimeTo24h(slot)).filter(Boolean)
          : [];
        const isDateBlocked = Boolean(data?.isDateBlocked);

        setBookedSlotsByDate((previous) => ({
          ...previous,
          [targetDate]: slots,
        }));
        setBlockedDatesByDate((previous) => ({
          ...previous,
          [targetDate]: isDateBlocked,
        }));

        return { slots, isDateBlocked };
      } catch (error) {
        console.error("Error fetching booked slots", error);
        return { slots: [], isDateBlocked: false };
      }
    },
    [providerId],
  );

  useEffect(() => {
    if (step !== 1 || !providerId || !provider || isLoadingProvider) return;

    const upcomingDates = [];
    const enforceAvailableDays = providerAllowedDaySet.size > 0;
    let cursor = new Date();
    cursor.setHours(0, 0, 0, 0);
    let guard = 0;

    while (upcomingDates.length < BOOKING_WINDOW_DAYS && guard < 120) {
      const weekdayToken = getWeekdayTokenFromDate(cursor);
      if (!enforceAvailableDays || providerAllowedDaySet.has(weekdayToken)) {
        upcomingDates.push(toDateInput(cursor));
      }
      cursor.setDate(cursor.getDate() + 1);
      guard += 1;
    }

    if (!upcomingDates.length) return;

    Promise.all(
      upcomingDates.map((dayValue) => fetchBookedSlotsForDate(dayValue)),
    ).catch(() => null);
  }, [
    step,
    providerId,
    provider,
    isLoadingProvider,
    providerAllowedDaySet,
    fetchBookedSlotsForDate,
  ]);

  useEffect(() => {
    if (
      step !== 1 ||
      !activeDate ||
      !providerId ||
      !provider ||
      isLoadingProvider
    ) {
      return;
    }

    let ignore = false;
    setIsLoadingSlots(true);

    fetchBookedSlotsForDate(activeDate).finally(() => {
      if (!ignore) setIsLoadingSlots(false);
    });

    return () => {
      ignore = true;
    };
  }, [
    step,
    activeDate,
    providerId,
    provider,
    isLoadingProvider,
    fetchBookedSlotsForDate,
  ]);

  const normalizeSelectedDates = useCallback(
    (dates) => [...new Set((dates || []).filter(Boolean))].sort(sortDateAsc),
    [],
  );

  useEffect(() => {
    if (!selectedDates.length) return;

    const validDates = selectedDates.filter(
      (dateValue) => !blockedDatesByDate?.[dateValue],
    );
    const normalizedDates = normalizeSelectedDates(validDates);
    const cappedDates =
      isFullDayCaretakerBooking && dateMode === "multiple"
        ? normalizedDates.slice(0, MAX_DAYCARE_SELECTED_DAYS)
        : normalizedDates;
    if (
      cappedDates.length === selectedDates.length &&
      cappedDates.every(
        (dateValue, index) => dateValue === selectedDates[index],
      )
    ) {
      return;
    }

    setSelectedDates(cappedDates);
    if (dateMode === "multiple") {
      setRangeAnchorDate(cappedDates[0] || "");
    }
    if (activeDate && !cappedDates.includes(activeDate)) {
      const nextActiveDate = cappedDates[cappedDates.length - 1] || "";
      setActiveDate(nextActiveDate);
      if (!nextActiveDate) {
        setFormData((previous) => ({
          ...previous,
          time: "",
        }));
      }
    }
  }, [
    activeDate,
    blockedDatesByDate,
    dateMode,
    isFullDayCaretakerBooking,
    normalizeSelectedDates,
    rangeAnchorDate,
    selectedDates,
  ]);

  useEffect(() => {
    if (!selectedDates.length || providerAllowedDaySet.size === 0) return;

    const validDates = selectedDates.filter((dateValue) =>
      providerAllowedDaySet.has(getWeekdayTokenFromDate(dateValue)),
    );
    const normalizedDates = normalizeSelectedDates(validDates);
    const cappedDates =
      isFullDayCaretakerBooking && dateMode === "multiple"
        ? normalizedDates.slice(0, MAX_DAYCARE_SELECTED_DAYS)
        : normalizedDates;
    if (
      cappedDates.length === selectedDates.length &&
      cappedDates.every(
        (dateValue, index) => dateValue === selectedDates[index],
      )
    ) {
      return;
    }

    setSelectedDates(cappedDates);
    if (dateMode === "multiple") {
      setRangeAnchorDate(cappedDates[0] || "");
    }
    if (activeDate && !cappedDates.includes(activeDate)) {
      const nextActiveDate = cappedDates[cappedDates.length - 1] || "";
      setActiveDate(nextActiveDate);
      if (!nextActiveDate) {
        setFormData((previous) => ({
          ...previous,
          time: "",
        }));
      }
    }
  }, [
    activeDate,
    dateMode,
    isFullDayCaretakerBooking,
    normalizeSelectedDates,
    providerAllowedDaySet,
    rangeAnchorDate,
    selectedDates,
  ]);

  useEffect(() => {
    if (dateMode !== "multiple") return;
    if (!selectedDates.length) {
      if (rangeAnchorDate) setRangeAnchorDate("");
      return;
    }
    if (!selectedDates.includes(rangeAnchorDate)) {
      setRangeAnchorDate(selectedDates[0]);
    }
  }, [dateMode, rangeAnchorDate, selectedDates]);

  const isValidPhone = useMemo(
    () => /^[1-9][0-9]{9}$/.test(formData.parentPhone || ""),
    [formData.parentPhone],
  );

  const canProceed = useMemo(() => {
    if (step === 1) {
      return Boolean(
        providerId &&
        !isLoadingProvider &&
        selectedDates.length > 0 &&
        (isFullDayCaretakerBooking || formData.time),
      );
    }

    if (step === 2) {
      return Boolean(
        formData.service &&
        formData.petName.trim() &&
        normalizePetType(formData.petType) &&
        (!isOtherPetType(formData.petType) ||
          formData.otherPetType.trim() ||
          Boolean(selectedPetId)) &&
        isValidPhone,
      );
    }

    return true;
  }, [
    formData.petName,
    formData.petType,
    formData.otherPetType,
    formData.service,
    formData.time,
    isFullDayCaretakerBooking,
    isLoadingProvider,
    isValidPhone,
    providerId,
    selectedPetId,
    selectedDates.length,
    step,
  ]);

  const sortedSelectedDates = useMemo(
    () => [...selectedDates].sort(sortDateAsc),
    [selectedDates],
  );
  const isSelectedRangeContinuous = useMemo(() => {
    if (sortedSelectedDates.length < 2) return false;
    for (let index = 1; index < sortedSelectedDates.length; index += 1) {
      const previousDate = new Date(sortedSelectedDates[index - 1]);
      previousDate.setDate(previousDate.getDate() + 1);
      if (toDateInput(previousDate) !== sortedSelectedDates[index]) {
        return false;
      }
    }
    return true;
  }, [sortedSelectedDates]);
  const formatDateList = useCallback(
    (dates = []) =>
      dates
        .map((dateValue) => toDisplayDate(dateValue))
        .filter(Boolean)
        .join(", "),
    [],
  );
  const isParentPhoneLocked = Boolean(storedUserPhone);
  const petTypeDisplayLabel = useMemo(() => {
    if (!isOtherPetType(formData.petType)) {
      return normalizePetType(formData.petType) || "Other";
    }
    const manualType = (formData.otherPetType || "").trim();
    return manualType ? `Other (${manualType})` : "Other";
  }, [formData.petType, formData.otherPetType]);

  const reasonPayload = useMemo(() => {
    const note =
      (formData.reason || "").trim() || "No additional notes provided.";
    if (!isOtherPetType(formData.petType)) return note;
    const manualType = (formData.otherPetType || "").trim();
    return manualType ? `${note}\nPet type detail: ${manualType}` : note;
  }, [formData.reason, formData.petType, formData.otherPetType]);

  const showPricing = Number(providerFee) > 0 || Number(totalPayable) > 0;
  const safeCoinsToUse = Math.max(0, Number(coinsToUse) || 0);
  const safeMaxCoins = Math.max(0, Number(maxCoins) || 0);
  const safeCoinRate = Math.max(1, Number(coinRate) || 10);

  const handleChange = (event) =>
    setFormData((previous) => ({
      ...previous,
      [event.target.name]: event.target.value,
    }));
  const handleAddToMyPetsToggle = (event) =>
    setFormData((previous) => ({
      ...previous,
      addToMyPets: Boolean(event.target.checked),
    }));

  const handleSelectPet = (value) =>
    setFormData((previous) => ({
      ...previous,
      petType: normalizePetType(value),
      otherPetType: isOtherPetType(value) ? previous.otherPetType : "",
    }));

  const handleUserPetSelect = (event) => {
    const petId = event.target.value;
    setSelectedPetId(petId);

    if (!petId) {
      setFormData((previous) => ({
        ...previous,
        parentPhone: previous.parentPhone || storedUserPhone,
      }));
      setPreviewPetImages([]);
      setPetImageFiles([]);
      return;
    }
    const selectedPet = userPets.find((pet) => pet._id === petId);
    if (!selectedPet) return;

    setFormData((previous) => ({
      ...previous,
      petName: selectedPet.name || "",
      petType: normalizePetType(selectedPet.species),
      otherPetType: "",
      healthIssues: (selectedPet.medicalConditions || []).join(", "),
      parentPhone: previous.parentPhone || storedUserPhone,
      addToMyPets: false,
    }));

    // Handle Pet Images
    const petImages = [];
    const mainImage =
      selectedPet.profileImage ||
      selectedPet.image ||
      selectedPet.avatar ||
      (Array.isArray(selectedPet.images) && selectedPet.images[0]);

    if (mainImage) {
      petImages.push(mainImage);
    }

    if (Array.isArray(selectedPet.images)) {
      selectedPet.images.forEach((img) => {
        if (img && img !== mainImage) {
          petImages.push(img);
        }
      });
    }

    const formattedPreviews = petImages
      .map((img) => {
        if (!img || typeof img !== "string") return "";
        if (/^https?:\/\//i.test(img)) return img;
        const normalized = img.replace(/^\/+/, "");
        if (normalized.startsWith("uploads/"))
          return `${BASE_URL}/${normalized}`;
        return `${BASE_URL}/uploads/pets/${normalized}`;
      })
      .filter(Boolean);

    setPreviewPetImages(formattedPreviews);
    setPetImageFiles([]); // Clear any manual files when switching to a known pet
  };

  const handleImageSelect = (event) => {
    const files = Array.from(event.target.files || []);
    setPetImageFiles((prev) => [...prev, ...files]);
    setPreviewPetImages((previous) => [
      ...previous,
      ...files.map((file) => URL.createObjectURL(file)),
    ]);
  };

  const handleRemovePetImage = (indexToRemove) => {
    setPreviewPetImages((prev) => {
      const urlToRemove = prev[indexToRemove];
      const isLocalBlob =
        urlToRemove &&
        typeof urlToRemove === "string" &&
        urlToRemove.startsWith("blob:");

      if (isLocalBlob) {
        let blobIndex = -1;
        for (let i = 0; i <= indexToRemove; i++) {
          if (typeof prev[i] === "string" && prev[i].startsWith("blob:")) {
            blobIndex++;
          }
        }
        setPetImageFiles((files) =>
          files.filter((_, idx) => idx !== blobIndex),
        );
        URL.revokeObjectURL(urlToRemove);
      }
      return prev.filter((_, idx) => idx !== indexToRemove);
    });
  };

  const handleDateModeChange = (mode) => {
    if (!enableMultipleDates) return;
    if (mode === dateMode) return;

    if (mode === "single") {
      const nextDate = activeDate || sortedSelectedDates[0] || "";
      setDateMode("single");
      setRangeAnchorDate("");
      setActiveDate(nextDate);
      setSelectedDates(nextDate ? [nextDate] : []);
      return;
    }

    setDateMode("multiple");
    const nextAnchorDate = activeDate || sortedSelectedDates[0] || "";
    setRangeAnchorDate(nextAnchorDate);
    if (nextAnchorDate) {
      setActiveDate(nextAnchorDate);
      setSelectedDates([nextAnchorDate]);
    } else {
      setSelectedDates([]);
    }
  };

  const handleDateChange = async (value) => {
    if (dateMode === "single") {
      if (value) {
        const weekdayToken = getWeekdayTokenFromDate(value);
        if (
          providerAllowedDaySet.size > 0 &&
          (!weekdayToken || !providerAllowedDaySet.has(weekdayToken))
        ) {
          toast.error("This day is not available for booking.");
          return;
        }
        const latestAvailability = await fetchBookedSlotsForDate(value);
        if (latestAvailability?.isDateBlocked) {
          toast.error("This date already has a confirmed booking.");
          return;
        }
      }
      setActiveDate(value);
      setRangeAnchorDate("");
      setSelectedDates(value ? [value] : []);
      return;
    }

    if (!value) return;

    const selectedWeekdayToken = getWeekdayTokenFromDate(value);
    if (
      providerAllowedDaySet.size > 0 &&
      (!selectedWeekdayToken ||
        !providerAllowedDaySet.has(selectedWeekdayToken))
    ) {
      toast.error("This day is not available for booking.");
      return;
    }

    const latestAvailability = await fetchBookedSlotsForDate(value);
    if (latestAvailability?.isDateBlocked) {
      toast.error("This date already has a confirmed booking.");
      return;
    }

    if (selectedDates.length > 1 && selectedDates.includes(value)) {
      setRangeAnchorDate(value);
      setActiveDate(value);
      setSelectedDates([value]);
      return;
    }

    if (
      selectedDates.length === 1 &&
      selectedDates[0] === value &&
      rangeAnchorDate === value
    ) {
      setRangeAnchorDate("");
      setActiveDate("");
      setSelectedDates([]);
      setFormData((previous) => ({
        ...previous,
        time: "",
      }));
      return;
    }

    const nextAnchorDate = rangeAnchorDate || selectedDates[0] || value;
    if (!nextAnchorDate) {
      return;
    }

    const fullRangeDates = buildDateRangeInclusive(nextAnchorDate, value);
    if (!fullRangeDates.length) {
      toast.error(
        "Selected range includes unavailable dates. Please choose another range.",
      );
      return;
    }
    const nextSelectedDates = fullRangeDates.filter((dateValue) => {
      if (!providerAllowedDaySet.size) return true;
      const weekdayToken = getWeekdayTokenFromDate(dateValue);
      return Boolean(weekdayToken && providerAllowedDaySet.has(weekdayToken));
    });
    if (!nextSelectedDates.length) {
      toast.error("No provider-available dates found in this range.");
      return;
    }
    if (
      isFullDayCaretakerBooking &&
      nextSelectedDates.length > MAX_DAYCARE_SELECTED_DAYS
    ) {
      toast.error(
        `You can select up to ${MAX_DAYCARE_SELECTED_DAYS} days for daycare booking.`,
      );
      return;
    }

    const rangeAvailability = await Promise.all(
      nextSelectedDates.map((dateValue) => fetchBookedSlotsForDate(dateValue)),
    );
    const blockedDatesInRange = nextSelectedDates.filter(
      (dateValue, index) => rangeAvailability[index]?.isDateBlocked,
    );
    if (blockedDatesInRange.length > 0) {
      const bookableDates = nextSelectedDates.filter(
        (dateValue, index) => !rangeAvailability[index]?.isDateBlocked,
      );
      const blockedLabel = formatDateList(blockedDatesInRange);
      const bookableLabel = formatDateList(bookableDates);
      const blockedVerb = blockedDatesInRange.length > 1 ? "are" : "is";
      toast.error(
        bookableLabel
          ? `${blockedLabel} ${blockedVerb} already booked. You can book for: ${bookableLabel}.`
          : `${blockedLabel} ${blockedVerb} already booked. Please choose another range.`,
      );
      return;
    }

    if (!rangeAnchorDate) {
      setRangeAnchorDate(nextAnchorDate);
    }
    setActiveDate(value);
    setSelectedDates(nextSelectedDates);
  };

  const hasUnsavedChanges = useMemo(() => {
    if (step === 4) return false;
    const editableKeys = [
      "service",
      "petName",
      "petType",
      "otherPetType",
      "parentPhone",
      "time",
      "reason",
      "healthIssues",
      "addToMyPets",
    ];
    const fieldsChanged = editableKeys.some(
      (key) =>
        String(formData?.[key] || "").trim() !==
        String(initialFormData?.[key] || "").trim(),
    );
    return (
      fieldsChanged ||
      selectedDates.length > 0 ||
      Boolean(selectedPetId) ||
      petImageFiles.length > 0 ||
      safeCoinsToUse > 0 ||
      selectedPaymentMethod !== "Cash"
    );
  }, [
    step,
    formData,
    initialFormData,
    selectedDates.length,
    selectedPetId,
    petImageFiles.length,
    safeCoinsToUse,
    selectedPaymentMethod,
  ]);
  const requestClose = useCallback(() => {
    if (hasUnsavedChanges) {
      setShowLeaveConfirm(true);
      return;
    }
    onClose?.();
  }, [hasUnsavedChanges, onClose]);

  const handleBack = () => {
    if (step === 1) {
      requestClose();
      return;
    }
    setStep((previous) => Math.max(previous - 1, 1));
  };

  const validateSelectedSlots = useCallback(async () => {
    const selectedTime = normalizeTimeTo24h(formData.time);
    if (
      isFullDayCaretakerBooking &&
      sortedSelectedDates.length > MAX_DAYCARE_SELECTED_DAYS
    ) {
      toast.error(
        `You can select up to ${MAX_DAYCARE_SELECTED_DAYS} days for daycare booking.`,
      );
      return false;
    }
    if (!isFullDayCaretakerBooking && !selectedTime) {
      toast.error("Select a valid time slot.");
      return false;
    }

    const conflictDates = [];
    const blockedDatesWithConfirmedBookings = [];
    for (const bookingDate of sortedSelectedDates) {
      const availability = await fetchBookedSlotsForDate(bookingDate);
      if (availability?.isDateBlocked) {
        blockedDatesWithConfirmedBookings.push(bookingDate);
        continue;
      }
      if (
        !isFullDayCaretakerBooking &&
        (availability?.slots || []).includes(selectedTime)
      ) {
        conflictDates.push(bookingDate);
      }
    }

    if (blockedDatesWithConfirmedBookings.length > 0) {
      const invalidDatesSet = new Set([
        ...blockedDatesWithConfirmedBookings,
        ...conflictDates,
      ]);

      if (dateMode === "multiple") {
        setSelectedDates((previous) =>
          previous.filter((dateValue) => !invalidDatesSet.has(dateValue)),
        );
      } else {
        setSelectedDates([]);
        setActiveDate("");
      }

      setFormData((previous) => ({
        ...previous,
        time: "",
      }));

      toast.error(
        (() => {
          const blockedLabel = formatDateList(
            blockedDatesWithConfirmedBookings,
          );
          const remainingDates = sortedSelectedDates.filter(
            (dateValue) => !invalidDatesSet.has(dateValue),
          );
          const remainingLabel = formatDateList(remainingDates);
          const blockedVerb =
            blockedDatesWithConfirmedBookings.length > 1 ? "are" : "is";
          return remainingLabel
            ? `${blockedLabel} ${blockedVerb} already booked. You can continue with: ${remainingLabel}.`
            : `${blockedLabel} ${blockedVerb} already booked. Please select another date range.`;
        })(),
      );
      return false;
    }

    if (!conflictDates.length) {
      return true;
    }

    if (dateMode === "multiple") {
      setSelectedDates((previous) =>
        previous.filter((dateValue) => !conflictDates.includes(dateValue)),
      );
      toast.error(
        (() => {
          const conflictLabel = formatDateList(conflictDates);
          const remainingDates = sortedSelectedDates.filter(
            (dateValue) => !conflictDates.includes(dateValue),
          );
          const remainingLabel = formatDateList(remainingDates);
          const conflictVerb = conflictDates.length > 1 ? "have" : "has";
          return remainingLabel
            ? `${conflictLabel} already ${conflictVerb} this slot booked. You can continue with: ${remainingLabel}.`
            : `${conflictLabel} already ${conflictVerb} this slot booked. Please reselect dates/time.`;
        })(),
      );
      return false;
    }

    setFormData((previous) => ({
      ...previous,
      time: "",
    }));
    toast.error(
      "This time slot is no longer available. Please choose another.",
    );
    return false;
  }, [
    dateMode,
    fetchBookedSlotsForDate,
    formatDateList,
    formData.time,
    isFullDayCaretakerBooking,
    sortedSelectedDates,
  ]);

  const handleNext = async () => {
    if (step === 1 && !providerId) {
      toast.error("Select a daycare/caretaker first to continue.");
      return;
    }

    if (step === 1 && isLoadingProvider) {
      toast.error("Loading provider availability. Please wait a moment.");
      return;
    }

    if (step === 1 && !canProceed) {
      toast.error(
        isFullDayCaretakerBooking
          ? "Select at least one date to continue."
          : "Select date(s) and time to continue.",
      );
      return;
    }

    if (step === 1) {
      const slotsValid = await validateSelectedSlots();
      if (!slotsValid) return;
    }

    if (step === 2 && !canProceed) {
      toast.error("Complete all required details before continuing.");
      return;
    }

    setStep((previous) => Math.min(previous + 1, BOOKING_STEPS.length));
  };

  const buildPayload = (bookingDates) => {
    const payload = new FormData();
    const primaryDate = bookingDates[0] || "";
    const payloadSource = {
      providerType: normalizedProviderType,
      providerId,
      service: formData.service,
      petName: formData.petName.trim(),
      petType: normalizePetType(formData.petType) || "Other",
      otherPetType: (formData.otherPetType || "").trim(),
      parentPhone: formData.parentPhone.trim(),
      date: primaryDate,
      time: isFullDayCaretakerBooking ? "00:00" : formData.time,
      reason: reasonPayload,
      healthIssues: formData.healthIssues.trim(),
      paymentMethod: supportsOnlinePayment ? selectedPaymentMethod : "Cash",
    };

    Object.entries(payloadSource).forEach(([key, value]) =>
      payload.append(key, value),
    );

    if (selectedPetId) {
      payload.append("petId", selectedPetId);
    }

    if (Boolean(formData.addToMyPets) && !selectedPetId) {
      payload.append("addToMyPets", "true");
    }

    if (safeCoinsToUse > 0) {
      payload.append("coinsToUse", String(safeCoinsToUse));
    }

    payload.append("selectedDates", JSON.stringify(bookingDates));

    petImageFiles.forEach((file) => payload.append("petImages", file));
    return payload;
  };

  const submitBooking = async () => {
    if (!providerId) {
      toast.error("Select a daycare/caretaker before booking.");
      return null;
    }

    setIsLoading(true);

    try {
      const token =
        localStorage.getItem("token") || sessionStorage.getItem("token");
      if (!token) {
        toast.error("Please login to continue.");
        return null;
      }

      const selectedTime = isFullDayCaretakerBooking
        ? ""
        : normalizeTimeTo24h(formData.time);

      const bookingDates =
        enableMultipleDates && dateMode === "multiple"
          ? sortedSelectedDates
          : sortedSelectedDates.slice(0, 1);

      if (!bookingDates.length) {
        toast.error("Please select at least one date.");
        return null;
      }
      if (
        isFullDayCaretakerBooking &&
        bookingDates.length > MAX_DAYCARE_SELECTED_DAYS
      ) {
        toast.error(
          `You can select up to ${MAX_DAYCARE_SELECTED_DAYS} days for daycare booking.`,
        );
        return null;
      }

      const conflictDates = [];
      const blockedDatesWithConfirmedBookings = [];
      for (const bookingDate of bookingDates) {
        const availability = await fetchBookedSlotsForDate(bookingDate);
        if (availability?.isDateBlocked) {
          blockedDatesWithConfirmedBookings.push(bookingDate);
          continue;
        }
        if (
          !isFullDayCaretakerBooking &&
          selectedTime &&
          (availability?.slots || []).includes(selectedTime)
        ) {
          conflictDates.push(bookingDate);
        }
      }

      if (blockedDatesWithConfirmedBookings.length > 0) {
        const blockedLabel = formatDateList(blockedDatesWithConfirmedBookings);
        const bookableDates = bookingDates.filter(
          (dateValue) => !blockedDatesWithConfirmedBookings.includes(dateValue),
        );
        const bookableLabel = formatDateList(bookableDates);
        const blockedVerb =
          blockedDatesWithConfirmedBookings.length > 1 ? "are" : "is";
        toast.error(
          bookableLabel
            ? `${blockedLabel} ${blockedVerb} already booked. You can book for: ${bookableLabel}.`
            : `${blockedLabel} ${blockedVerb} already booked. Please choose another range.`,
        );
        return null;
      }

      if (conflictDates.length > 0) {
        const conflictLabel = formatDateList(conflictDates);
        const availableDates = bookingDates.filter(
          (dateValue) => !conflictDates.includes(dateValue),
        );
        const availableLabel = formatDateList(availableDates);
        const conflictVerb = conflictDates.length > 1 ? "have" : "has";
        toast.error(
          availableLabel
            ? `${conflictLabel} already ${conflictVerb} this slot booked. You can book for: ${availableLabel}.`
            : `${conflictLabel} already ${conflictVerb} this slot booked. Please choose another slot.`,
        );
        return null;
      }

      const response = await fetch(`${API_BASE_URL}/appointments`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: buildPayload(bookingDates),
      });

      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        const conflictingDatesFromApi = Array.isArray(data?.conflictingDates)
          ? data.conflictingDates
          : [];
        if (conflictingDatesFromApi.length > 0) {
          const conflictingLabel = formatDateList(conflictingDatesFromApi);
          const bookableDates = bookingDates.filter(
            (dateValue) => !conflictingDatesFromApi.includes(dateValue),
          );
          const bookableLabel = formatDateList(bookableDates);
          const conflictingVerb =
            conflictingDatesFromApi.length > 1 ? "are" : "is";
          toast.error(
            bookableLabel
              ? `${conflictingLabel} ${conflictingVerb} already booked. You can book for: ${bookableLabel}.`
              : `${conflictingLabel} ${conflictingVerb} already booked. Please choose another range.`,
          );
          return null;
        }
        toast.error(data.message || "Failed to submit booking request.");
        return null;
      }

      const requiresPaymentNow =
        supportsOnlinePayment &&
        selectedPaymentMethod === "Online" &&
        Number(data?.totalAmount || 0) > 0;
      toast.success(
        requiresPaymentNow
          ? "Booking created. Complete payment to confirm."
          : bookingDates.length > 1
            ? `Booking request submitted for ${bookingDates.length} dates.`
            : "Daycare request submitted successfully.",
      );

      return {
        successful: [data],
        failed: [],
      };
    } catch {
      toast.error("Error booking service. Try again!");
      return null;
    } finally {
      setIsLoading(false);
    }
  };
  const cancelPendingOnlineAppointment = useCallback(
    async (appointmentId, token) => {
      if (!appointmentId || !token) return;
      try {
        await fetch(`${API_BASE_URL}/appointments/${appointmentId}/status`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            status: "cancelled",
            cancellationReason: "Online payment not completed by user.",
          }),
        });
      } catch {
        // best effort cancellation
      }
    },
    [],
  );
  const processOnlineAppointmentPayment = useCallback(
    async (appointment, token) => {
      const orderRes = await fetch(
        `${API_BASE_URL}/payment/create-appointment-order`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            appointmentId: appointment._id,
          }),
        },
      );
      const paymentOrder = await orderRes.json().catch(() => ({}));
      if (!orderRes.ok) {
        throw new Error(
          paymentOrder?.message || "Unable to start online payment",
        );
      }
      await loadRazorpay();
      if (!window?.Razorpay) {
        throw new Error("Razorpay SDK is not available");
      }

      return new Promise((resolve, reject) => {
        const options = {
          key: import.meta.env.VITE_RAZORPAY_KEY_ID,
          amount: paymentOrder.amount,
          currency: "INR",
          name: "PetVault",
          order_id: paymentOrder.id,
          handler: async (response) => {
            try {
              const verifyRes = await fetch(
                `${API_BASE_URL}/payment/verify-appointment`,
                {
                  method: "POST",
                  headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                  },
                  body: JSON.stringify({
                    appointmentId: appointment._id,
                    razorpay_order_id: response.razorpay_order_id,
                    razorpay_payment_id: response.razorpay_payment_id,
                    razorpay_signature: response.razorpay_signature,
                  }),
                },
              );
              const verifyData = await verifyRes.json().catch(() => ({}));
              if (!verifyRes.ok) {
                reject(
                  new Error(
                    verifyData?.message ||
                      "Unable to verify appointment payment",
                  ),
                );
                return;
              }
              resolve(verifyData?.appointment || appointment);
            } catch {
              reject(new Error("Unable to verify appointment payment"));
            }
          },
          modal: {
            ondismiss: () => reject(new Error("Payment cancelled")),
          },
          theme: {
            color: "#7c3aed",
          },
        };

        try {
          new window.Razorpay(options).open();
        } catch {
          reject(new Error("Unable to open payment window"));
        }
      });
    },
    [],
  );

  const handleConfirm = async () => {
    const token =
      localStorage.getItem("token") || sessionStorage.getItem("token");
    if (!token) {
      toast.error("Please login to continue");
      return;
    }

    const result = await submitBooking();
    if (!result) return;

    let successfulAppointments = Array.isArray(result.successful)
      ? [...result.successful]
      : [];
    const requiresGatewayPayment =
      supportsOnlinePayment &&
      selectedPaymentMethod === "Online" &&
      successfulAppointments.length === 1 &&
      Number(successfulAppointments[0]?.totalAmount || 0) > 0 &&
      String(successfulAppointments[0]?.paymentStatus || "").toLowerCase() !==
        "paid";

    if (requiresGatewayPayment) {
      setIsLoading(true);
      try {
        const paidAppointment = await processOnlineAppointmentPayment(
          successfulAppointments[0],
          token,
        );
        successfulAppointments = [paidAppointment];
        toast.success("Payment successful and booking confirmed");
      } catch (error) {
        await cancelPendingOnlineAppointment(
          successfulAppointments[0]?._id,
          token,
        );
        toast.error(error?.message || "Online payment was not completed");
        setIsLoading(false);
        return;
      } finally {
        setIsLoading(false);
      }
    }

    setBookedAppointments(successfulAppointments);
    setFailedBookings(result.failed);
    const hasConfirmedBooking = successfulAppointments.some(
      (appointment) =>
        String(appointment?.status || "").toLowerCase() === "confirmed",
    );
    if (hasConfirmedBooking && !isFullDayCaretakerBooking && formData.time) {
      const selectedTime = normalizeTimeTo24h(formData.time);
      for (const bookingDate of sortedSelectedDates) {
        setBookedSlotsByDate((previous) => ({
          ...previous,
          [bookingDate]: [
            ...new Set(
              [...(previous[bookingDate] || []), selectedTime].filter(Boolean),
            ),
          ],
        }));
      }
    }
    if (shouldBlockDateOnConfirmed && hasConfirmedBooking) {
      setBlockedDatesByDate((previous) => {
        const nextState = { ...previous };
        sortedSelectedDates.forEach((bookingDate) => {
          nextState[bookingDate] = true;
        });
        return nextState;
      });
    }
    setStep(4);
  };

  const resetWizard = () => {
    previewPetImages.forEach((url) => URL.revokeObjectURL(url));
    setStep(1);
    setBookedAppointments([]);
    setFailedBookings([]);
    setDateMode("single");
    setActiveDate("");
    setRangeAnchorDate("");
    setSelectedDates([]);
    setBookedSlotsByDate({});
    setBlockedDatesByDate({});
    setSelectedPetId("");
    setPetImageFiles([]);
    setPreviewPetImages([]);
    setCoinsToUse(0);
    setSelectedPaymentMethod("Cash");
    setFormData({
      ...initialFormData,
    });
  };

  const titles = {
    1: {
      title: "Choose Date and Time",
      subtitle: enableMultipleDates
        ? "Select a continuous date range, then continue."
        : "Pick the most suitable slot.",
    },
    2: {
      title: "Share Pet Information",
      subtitle: "Fill pet and owner details.",
    },
    3: {
      title: "Confirmation",
      subtitle: "Review details before confirming your booking.",
    },
    4: {
      title: "Booking Confirmed",
      subtitle: "Your booking request has been submitted.",
    },
  };
  useEffect(() => {
    onStepChange?.(step);
    scrollAppToTop({ behavior: "smooth" });
    const frame = window.requestAnimationFrame(() => {
      scrollAppToTop({ behavior: "smooth" });
    });
    return () => window.cancelAnimationFrame(frame);
  }, [step, onStepChange]);

  return (
    <div className={styles.formContainer}>
      <AppointmentFlow
        steps={BOOKING_STEPS}
        currentStep={step}
        title={titles[step].title}
        subtitle={titles[step].subtitle}
        canProceed={canProceed}
        isSubmitting={isLoading}
        onBack={handleBack}
        onNext={handleNext}
        onConfirm={handleConfirm}
        confirmLabel="Book Appointment"
      >
        <ProviderSummaryCard
          provider={provider}
          providerImage={providerImage}
          providerName={providerName}
          providerMeta={providerMeta}
          providerId={providerId}
          isLoadingProvider={isLoadingProvider}
          onImageError={(event) => {
            event.currentTarget.src = DEFAULT_PROVIDER_IMAGE;
          }}
        />

        {step === 1 && (
          <ScheduleStep
            enableMultipleDates={enableMultipleDates}
            dateMode={dateMode}
            onDateModeChange={handleDateModeChange}
            isFullDayCaretakerBooking={isFullDayCaretakerBooking}
            activeDate={activeDate}
            selectedTime={formData.time}
            onDateChange={handleDateChange}
            onTimeChange={(value) =>
              setFormData((previous) => ({
                ...previous,
                time: value,
              }))
            }
            sortedSelectedDates={sortedSelectedDates}
            providerTimeGroups={providerTimeGroups}
            providerDays={providerDays}
            bookedSlotsByDate={bookedSlotsByDate}
            blockedDates={blockedDates}
            isLoadingSlots={isLoadingSlots}
            showRangeHighlight={
              enableMultipleDates &&
              dateMode === "multiple" &&
              isSelectedRangeContinuous
            }
          />
        )}

        {step === 2 && (
          <DetailsStep
            providerType={normalizedProviderType}
            userPets={userPets}
            selectedPetId={selectedPetId}
            onUserPetSelect={handleUserPetSelect}
            formData={formData}
            onChange={handleChange}
            onSelectPetType={handleSelectPet}
            isPetPrefilled={false}
            initialPetName=""
            initialPetType=""
            isParentPhoneLocked={isParentPhoneLocked}
            onToggleAddToMyPets={handleAddToMyPetsToggle}
            onImageSelect={handleImageSelect}
            previewPetImages={previewPetImages}
            onRemoveImage={handleRemovePetImage}
          />
        )}

        {step === 3 && (
          <ReviewStep
            providerName={providerName}
            formData={formData}
            petTypeDisplayLabel={petTypeDisplayLabel}
            sortedSelectedDates={sortedSelectedDates}
            reasonPayload={reasonPayload}
            showPricing={showPricing}
            safeCoinRate={safeCoinRate}
            coinBalance={coinBalance}
            safeMaxCoins={safeMaxCoins}
            safeCoinsToUse={safeCoinsToUse}
            coinDiscount={coinDiscount}
            billingUnits={billingUnits}
            providerFee={providerFee}
            unitProviderFee={unitProviderFee}
            feePercent={feePercent}
            platformFee={platformFee}
            totalPayable={totalPayable}
            finalPayable={finalPayable}
            supportsOnlinePayment={supportsOnlinePayment}
            selectedPaymentMethod={selectedPaymentMethod}
            onPaymentMethodChange={setSelectedPaymentMethod}
            setCoinsToUse={setCoinsToUse}
          />
        )}

        {step === 4 && (
          <SuccessStep
            providerName={providerName}
            formData={formData}
            bookedAppointments={bookedAppointments}
            failedBookings={failedBookings}
            onBookAnother={resetWizard}
            onDone={() => onClose?.()}
            provider={provider}
            sortedSelectedDates={sortedSelectedDates}
          />
        )}
      </AppointmentFlow>
      {showLeaveConfirm && (
        <ConfirmationModal
          config={{
            title: "Leave This Page",
            message:
              "Filled appointment data will be lost. Do you want to leave this page?",
            confirmText: "Leave Page",
            type: "cancel",
          }}
          onConfirm={() => {
            setShowLeaveConfirm(false);
            onClose?.();
          }}
          onCancel={() => setShowLeaveConfirm(false)}
        />
      )}
    </div>
  );
};

export default ServiceBookingForm;

import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { HandHeart, Stethoscope, Store, X } from "lucide-react";
import styles from "./bookAppointmentModal.module.css";
import toast from "react-hot-toast";
import {
  AppointmentFlow,
  AppointmentScheduleSelector,
  Button,
} from "../../common";
import {
  CONTACT_BOOKING_STEPS,
  PET_BOOKING_STEPS,
  getBookingTitles,
} from "./config";
import {
  buildPetFormSnapshot,
  createInitialBookingFormData,
  getFallbackPetName,
  getStoredUser,
  normalizeTimeTo24h,
} from "./utils";
import {
  useBookingPricing,
  useBookingResources,
  useBookingValidation,
} from "./hooks";
import { submitAppointmentEnquiry, submitAppointmentRequest } from "./services";
import {
  AppointmentDetailsStep,
  AppointmentReviewStep,
  AppointmentSuccessStep,
  ProviderSummaryCard,
} from "./components";
import {
  getWeekdayTokenFromDate,
  normalizeWeekdayToken,
} from "../../../utils/weekday";
import { API_BASE_URL, BASE_URL } from "../../../utils/constants";
import {
  downloadPrescription,
  getProviderInfo,
} from "../../UserProfile/components/Appointments/utils/appointmentUtils";
import ConfirmationModal from "../../ConfirmationModal/ConfirmationModal";
const BOOKING_WINDOW_DAYS = 7;

const toDateInput = (value) => {
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const normalizePetTypeValue = (value) => {
  const normalized = String(value || "").trim();
  if (!normalized) return "";
  const lower = normalized.toLowerCase();
  if (lower === "others" || lower === "other") return "Other";
  return normalized;
};

const BookAppointmentModal = ({
  providerId,
  providerType = "doctor",
  onClose,
  onStepChange,
  initialPetId = null,
  initialService = "vet",
  initialPetName = "",
  initialPetType = "",
  enquiryPetId = "",
  enquiryMode = false,
  asPage = false,
}) => {
  const storedUser = useMemo(() => getStoredUser(), []);
  const storedUserPhone = useMemo(
    () =>
      storedUser?.phone || storedUser?.mobile || storedUser?.phoneNumber || "",
    [storedUser],
  );
  const isContactFlow = providerType === "shop" || providerType === "ngo";
  const isPetPrefilled =
    !isContactFlow && enquiryMode && Boolean(initialPetName || initialPetType);
  const isParentPhoneLocked = Boolean(storedUserPhone);
  const bookingSteps = isContactFlow
    ? CONTACT_BOOKING_STEPS
    : PET_BOOKING_STEPS;
  const fallbackPetName = getFallbackPetName(providerType);
  const titles = useMemo(
    () => getBookingTitles(isContactFlow),
    [isContactFlow],
  );
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [bookedAppointment, setBookedAppointment] = useState(null);
  const [selectedPetId, setSelectedPetId] = useState(initialPetId || "");
  const [petImageFiles, setPetImageFiles] = useState([]);
  const [previewPetImages, setPreviewPetImages] = useState([]);
  const [showLeaveConfirm, setShowLeaveConfirm] = useState(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState("Cash");
  const modalRef = useRef(null);
  const initialFormData = useMemo(
    () =>
      createInitialBookingFormData({
        providerType,
        providerId,
        initialService,
        initialPetName,
        initialPetType,
        storedUser,
      }),
    [
      providerType,
      providerId,
      initialService,
      initialPetName,
      initialPetType,
      storedUser,
    ],
  );
  const [formData, setFormData] = useState(() =>
    createInitialBookingFormData({
      providerType,
      providerId,
      initialService,
      initialPetName,
      initialPetType,
      storedUser,
    }),
  );
  const {
    provider,
    userPets,
    platformConfig,
    providerName,
    providerMeta,
    providerImage,
    providerDays,
    providerDaySet,
    providerTimeGroups,
    providerSlots,
    bookedSlotsForSelectedDate,
    bookedSlotsByDate,
    blockedDatesByDate,
    blockedDates,
    isLoadingBookedSlots,
    fetchBookedSlotsForDate,
    cacheBookedSlot,
  } = useBookingResources({
    providerId,
    providerType,
    selectedDate: formData.date,
  });
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
  } = useBookingPricing({
    provider,
    providerType,
    platformConfig,
  });
  const { canProceed } = useBookingValidation({
    formData,
    step,
    isContactFlow,
    isPetLocked: Boolean(selectedPetId) || isPetPrefilled,
  });
  const hasUnsavedChanges = useMemo(() => {
    if (step === 4) return false;
    const editableKeys = [
      "service",
      "petName",
      "petType",
      "otherPetType",
      "contactName",
      "contactEmail",
      "parentPhone",
      "date",
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
    const selectedPetChanged = selectedPetId !== (initialPetId || "");
    const imagesAdded = petImageFiles.length > 0;
    return (
      fieldsChanged ||
      selectedPetChanged ||
      imagesAdded ||
      selectedPaymentMethod !== "Cash"
    );
  }, [
    step,
    formData,
    initialFormData,
    selectedPetId,
    initialPetId,
    petImageFiles.length,
    selectedPaymentMethod,
  ]);
  const requestClose = useCallback(() => {
    if (hasUnsavedChanges) {
      setShowLeaveConfirm(true);
      return;
    }
    onClose?.();
  }, [hasUnsavedChanges, onClose]);
  const normalizedProviderDaySet = useMemo(
    () =>
      new Set(
        Array.from(providerDaySet || [])
          .map((day) => normalizeWeekdayToken(day))
          .filter(Boolean),
      ),
    [providerDaySet],
  );
  const resolvedPetName = (formData.petName || "").trim() || fallbackPetName;
  const resolvedPetType = normalizePetTypeValue(formData.petType) || "Other";
  const supportsOnlinePayment = useMemo(() => {
    if (isContactFlow) return false;
    const roleOrType = String(provider?.role || providerType || "")
      .trim()
      .toLowerCase();
    return ["doctor", "hospital", "caretaker", "daycare"].includes(roleOrType);
  }, [isContactFlow, provider?.role, providerType]);
  useEffect(() => {
    setFormData((previous) => ({
      ...previous,
      providerType,
      providerId,
      service: initialService,
      petName: previous.petName || initialPetName,
      petType: normalizePetTypeValue(previous.petType || initialPetType),
      parentPhone: previous.parentPhone || storedUserPhone,
    }));
  }, [
    providerId,
    providerType,
    initialService,
    initialPetName,
    initialPetType,
    storedUserPhone,
  ]);
  useEffect(() => {
    if (!supportsOnlinePayment && selectedPaymentMethod !== "Cash") {
      setSelectedPaymentMethod("Cash");
    }
  }, [selectedPaymentMethod, supportsOnlinePayment]);
  useEffect(() => {
    if (initialPetId && userPets.length > 0) {
      const pet = userPets.find((item) => item._id === initialPetId);
      if (!pet) return;
      setSelectedPetId(initialPetId);
      setFormData((previous) => ({
        ...previous,
        ...buildPetFormSnapshot(pet),
      }));

      // Handle Pet Images for initial selection
      const petImages = [];
      const mainImage =
        pet.profileImage ||
        pet.image ||
        pet.avatar ||
        (Array.isArray(pet.images) && pet.images[0]);

      if (mainImage) {
        petImages.push(mainImage);
      }

      if (Array.isArray(pet.images)) {
        pet.images.forEach((img) => {
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
    }
  }, [initialPetId, userPets]);
  useEffect(() => {
    return () => {
      previewPetImages.forEach((url) => {
        if (typeof url === "string" && url.startsWith("blob:")) {
          URL.revokeObjectURL(url);
        }
      });
    };
  }, [previewPetImages]);
  useEffect(() => {
    const modalElement = modalRef.current;
    if (modalElement) {
      modalElement.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    }
    if (asPage && typeof window !== "undefined") {
      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    }
  }, [step, asPage]);
  useEffect(() => {
    if (step !== 1 || !providerId || !provider) return;
    const upcomingDates = [];
    let cursor = new Date();
    cursor.setHours(0, 0, 0, 0);
    let guard = 0;
    while (upcomingDates.length < BOOKING_WINDOW_DAYS && guard < 120) {
      const weekdayToken = getWeekdayTokenFromDate(cursor);
      if (
        normalizedProviderDaySet.size === 0 ||
        normalizedProviderDaySet.has(weekdayToken)
      ) {
        upcomingDates.push(toDateInput(cursor));
      }
      cursor.setDate(cursor.getDate() + 1);
      guard += 1;
    }
    if (upcomingDates.length === 0) return;
    Promise.all(upcomingDates.map((day) => fetchBookedSlotsForDate(day))).catch(
      () => null,
    );
  }, [
    step,
    providerId,
    provider,
    normalizedProviderDaySet,
    fetchBookedSlotsForDate,
  ]);
  useEffect(() => {
    setFormData((previous) => {
      let nextDate = previous.date;
      let nextTime = previous.time;
      let changed = false;
      if (nextDate && normalizedProviderDaySet.size > 0) {
        const selectedDayToken = getWeekdayTokenFromDate(nextDate);
        if (
          !selectedDayToken ||
          !normalizedProviderDaySet.has(selectedDayToken)
        ) {
          nextDate = "";
          nextTime = "";
          changed = true;
        }
      }
      if (nextDate && blockedDatesByDate?.[nextDate]) {
        nextDate = "";
        nextTime = "";
        changed = true;
      }
      if (
        nextTime &&
        providerSlots.length > 0 &&
        !providerSlots.includes(nextTime)
      ) {
        nextTime = "";
        changed = true;
      }
      if (
        step < 4 &&
        nextTime &&
        bookedSlotsForSelectedDate.length > 0 &&
        bookedSlotsForSelectedDate.includes(nextTime)
      ) {
        nextTime = "";
        changed = true;
      }
      if (nextDate) {
        const selectedDate = new Date(nextDate);
        selectedDate.setHours(0, 0, 0, 0);
        const availableDates = [];
        let cursor = new Date();
        cursor.setHours(0, 0, 0, 0);
        let guard = 0;
        while (availableDates.length < BOOKING_WINDOW_DAYS && guard < 120) {
          const weekdayToken = getWeekdayTokenFromDate(cursor);
          if (
            normalizedProviderDaySet.size === 0 ||
            normalizedProviderDaySet.has(weekdayToken)
          ) {
            availableDates.push(toDateInput(cursor));
          }
          cursor.setDate(cursor.getDate() + 1);
          guard += 1;
        }
        if (!availableDates.includes(nextDate)) {
          nextDate = "";
          nextTime = "";
          changed = true;
        }
      }
      if (!changed) return previous;
      return {
        ...previous,
        date: nextDate,
        time: nextTime,
      };
    });
  }, [
    normalizedProviderDaySet,
    blockedDatesByDate,
    providerSlots,
    bookedSlotsForSelectedDate,
    step,
  ]);
  const handleChange = (e) =>
    setFormData((previous) => ({
      ...previous,
      [e.target.name]: e.target.value,
    }));
  const handleAddToMyPetsToggle = (e) =>
    setFormData((previous) => ({
      ...previous,
      addToMyPets: Boolean(e.target.checked),
    }));
  const handleSelectPet = (value) =>
    setFormData((previous) => ({
      ...previous,
      petType: normalizePetTypeValue(value),
      otherPetType:
        normalizePetTypeValue(value) === "Other" ? previous.otherPetType : "",
    }));
  const handleUserPetSelect = (e) => {
    const petId = e.target.value;
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
    const pet = userPets.find((item) => item._id === petId);
    if (!pet) return;
    const snapshot = buildPetFormSnapshot(pet);
    const normalizedPetType = normalizePetTypeValue(snapshot.petType);
    setFormData((previous) => ({
      ...previous,
      ...snapshot,
      petType: normalizedPetType,
      otherPetType:
        normalizedPetType === "Other" ? previous.otherPetType || "" : "",
      parentPhone: previous.parentPhone || storedUserPhone,
      addToMyPets: false,
    }));

    // Handle Pet Images
    const petImages = [];
    const mainImage =
      pet.profileImage ||
      pet.image ||
      pet.avatar ||
      (Array.isArray(pet.images) && pet.images[0]);

    if (mainImage) {
      petImages.push(mainImage);
    }

    if (Array.isArray(pet.images)) {
      pet.images.forEach((img) => {
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
    setPetImageFiles([]); // Clear manual files when switching to a known pet
  };
  const handleImageSelect = (e) => {
    const files = Array.from(e.target.files || []);
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
  const handleBack = () => {
    if (step === 1) {
      requestClose();
      return;
    }
    setStep((previous) => Math.max(previous - 1, 1));
  };
  const handleNext = async () => {
    if (step === 1 && !canProceed) {
      toast.error("Select appointment date and time.");
      return;
    }
    if (step === 1 && formData.date && formData.time) {
      const selectedTime = normalizeTimeTo24h(formData.time);
      const latestAvailability = await fetchBookedSlotsForDate(formData.date);
      if (latestAvailability?.isDateBlocked) {
        setFormData((previous) => ({
          ...previous,
          date: "",
          time: "",
        }));
        toast.error(
          "This date already has a confirmed booking. Choose another date.",
        );
        return;
      }
      const latestSlots = (latestAvailability?.slots || []).map((slot) =>
        normalizeTimeTo24h(slot),
      );
      if (selectedTime && latestSlots.includes(selectedTime)) {
        setFormData((previous) => ({
          ...previous,
          time: "",
        }));
        toast.error("This time slot is already booked. Choose another slot.");
        return;
      }
    }
    if (step === 2 && !canProceed) {
      toast.error(
        isContactFlow
          ? "Complete your contact details before continuing."
          : "Complete pet details before continuing.",
      );
      return;
    }
    setStep((previous) => Math.min(previous + 1, bookingSteps.length));
  };
  const submitBooking = async () => {
    setIsLoading(true);
    try {
      const token =
        localStorage.getItem("token") || sessionStorage.getItem("token");
      const { response, data } = await submitAppointmentRequest({
        token,
        formData,
        resolvedPetName,
        resolvedPetType,
        selectedPetId,
        enquiryPetId,
        petImageFiles,
        coinsToUse,
        paymentMethod: supportsOnlinePayment ? selectedPaymentMethod : "Cash",
        addToMyPets: Boolean(formData.addToMyPets) && !selectedPetId,
      });
      if (!response.ok) {
        toast.error(data.message || "Failed to book appointment");
        return null;
      }
      if (enquiryMode) {
        const enquiryPayload = {
          name:
            formData.contactName.trim() ||
            data.userName ||
            storedUser?.name ||
            "User",
          email:
            formData.contactEmail.trim() ||
            data.userEmail ||
            storedUser?.email ||
            "",
          phone: formData.parentPhone,
          message:
            (formData.reason || "").trim() || "No additional notes provided.",
          petId: enquiryPetId || undefined,
          petName: resolvedPetName,
          providerId,
          providerType,
          providerName: providerName,
          providerEmail: provider?.email || data?.providerId?.email || "",
          appointmentId: data._id,
        };
        try {
          await submitAppointmentEnquiry(enquiryPayload);
        } catch {
          // Keep appointment success even if enquiry mail fails.
        }
      }
      const requiresPaymentNow =
        supportsOnlinePayment &&
        selectedPaymentMethod === "Online" &&
        Number(data?.totalAmount || 0) > 0;
      toast.success(
        requiresPaymentNow
          ? "Appointment created. Complete payment to confirm."
          : "Appointment booked successfully!",
      );
      return data;
    } catch {
      toast.error("Error booking appointment");
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

    const appointment = await submitBooking();
    if (!appointment) return;

    let finalizedAppointment = appointment;
    const requiresGatewayPayment =
      supportsOnlinePayment &&
      selectedPaymentMethod === "Online" &&
      Number(appointment?.totalAmount || 0) > 0 &&
      String(appointment?.paymentStatus || "").toLowerCase() !== "paid";

    if (requiresGatewayPayment) {
      setIsLoading(true);
      try {
        finalizedAppointment = await processOnlineAppointmentPayment(
          appointment,
          token,
        );
        toast.success("Payment successful and appointment confirmed");
      } catch (error) {
        await cancelPendingOnlineAppointment(appointment?._id, token);
        toast.error(error?.message || "Online payment was not completed");
        setIsLoading(false);
        return;
      } finally {
        setIsLoading(false);
      }
    }

    const isConfirmedBooking =
      String(finalizedAppointment?.status || "").toLowerCase() === "confirmed";
    if (isConfirmedBooking && formData.date && formData.time) {
      cacheBookedSlot(formData.date, formData.time);
      fetchBookedSlotsForDate(formData.date).catch(() => null);
    }

    setBookedAppointment(finalizedAppointment);
    setStep(4);
  };
  const resetWizard = () => {
    previewPetImages.forEach((url) => URL.revokeObjectURL(url));
    setStep(1);
    setBookedAppointment(null);
    setPetImageFiles([]);
    setPreviewPetImages([]);
    setSelectedPetId(initialPetId || "");
    setSelectedPaymentMethod("Cash");
    setFormData(
      createInitialBookingFormData({
        providerType,
        providerId,
        initialService,
        initialPetName,
        initialPetType,
        storedUser,
      }),
    );
  };
  const ProviderIcon =
    providerType === "doctor"
      ? Stethoscope
      : providerType === "ngo"
        ? HandHeart
        : Store;
  const activeTitle = titles[step] || titles[1];
  useEffect(() => {
    onStepChange?.(step);
  }, [step, onStepChange]);
  return (
    <div className={`${styles.overlay} ${asPage ? styles.pageOverlay : ""}`}>
      <div
        ref={modalRef}
        className={`${styles.modal} ${asPage ? styles.pageModal : ""}`}
      >
        {!asPage && (
          <Button
            className={styles.closeButton}
            onClick={requestClose}
            type="button"
            variant="ghost"
            size="sm"
          >
            <X size={22} />
          </Button>
        )}

        <div className={styles.content}>
          <AppointmentFlow
            steps={bookingSteps}
            currentStep={step}
            title={activeTitle.title}
            subtitle={activeTitle.subtitle}
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
              ProviderIcon={ProviderIcon}
            />

            {step === 1 && (
              <AppointmentScheduleSelector
                date={formData.date}
                time={formData.time}
                onDateChange={(value) =>
                  setFormData((previous) => ({
                    ...previous,
                    date: value,
                  }))
                }
                onTimeChange={(value) =>
                  setFormData((previous) => ({
                    ...previous,
                    time: value,
                  }))
                }
                minDate={new Date()}
                timeGroups={providerTimeGroups}
                availableDays={providerDays}
                disabledSlots={bookedSlotsForSelectedDate}
                disabledSlotsByDate={bookedSlotsByDate}
                blockedDates={blockedDates}
                isLoadingSlots={isLoadingBookedSlots}
              />
            )}

            {step === 2 && (
              <AppointmentDetailsStep
                isContactFlow={isContactFlow}
                providerType={providerType}
                formData={formData}
                onChange={handleChange}
                onSelectPetType={handleSelectPet}
                onToggleAddToMyPets={handleAddToMyPetsToggle}
                userPets={userPets}
                selectedPetId={selectedPetId}
                onSelectUserPet={handleUserPetSelect}
                enquiryMode={enquiryMode}
                isPetPrefilled={isPetPrefilled}
                initialPetName={initialPetName}
                initialPetType={initialPetType}
                isParentPhoneLocked={isParentPhoneLocked}
                onImageSelect={handleImageSelect}
                previewPetImages={previewPetImages}
                onRemoveImage={handleRemovePetImage}
              />
            )}

            {step === 3 && (
              <AppointmentReviewStep
                providerName={providerName}
                formData={formData}
                isContactFlow={isContactFlow}
                resolvedPetName={resolvedPetName}
                resolvedPetType={resolvedPetType}
                coinBalance={coinBalance}
                coinRate={coinRate}
                coinsToUse={coinsToUse}
                setCoinsToUse={setCoinsToUse}
                feePercent={feePercent}
                platformFee={platformFee}
                totalPayable={totalPayable}
                maxCoins={maxCoins}
                coinDiscount={coinDiscount}
                providerFee={providerFee}
                finalPayable={finalPayable}
                paymentMethod={selectedPaymentMethod}
                onPaymentMethodChange={setSelectedPaymentMethod}
                showPaymentMethod={supportsOnlinePayment}
              />
            )}

            {step === 4 && (
              <AppointmentSuccessStep
                providerName={providerName}
                formData={formData}
                bookedAppointment={bookedAppointment}
                onBookAnother={resetWizard}
                onDone={() => onClose?.()}
                downloadPrescription={downloadPrescription}
                providerInfo={getProviderInfo(
                  { ...bookedAppointment, providerId: provider },
                  BASE_URL,
                )}
              />
            )}
          </AppointmentFlow>
        </div>
      </div>
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
export default BookAppointmentModal;

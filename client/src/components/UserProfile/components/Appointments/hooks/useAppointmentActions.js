import { useState } from "react";
import toast from "react-hot-toast";
import { API_BASE_URL, BASE_URL } from "../../../../../utils/constants";
import {
  getProviderInfo,
  getUserAvatar,
  getCancellationEligibility,
  isWithinProviderEditWindow,
  canAssignPetForAppointment,
  getListingPetRef,
} from "../utils/appointmentUtils";

export const useAppointmentActions = ({
  userRole,
  user,
  isProvider,
  fetchAppointments,
  initialActiveTab = "upcoming",
}) => {
  // UI States
  const [activeTab, setActiveTab] = useState(initialActiveTab);
  const [selectedAppt, setSelectedAppt] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState("view");
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [confirmConfig, setConfirmConfig] = useState(null);
  const [showCancelReasonModal, setShowCancelReasonModal] = useState(false);
  const [appointmentToCancel, setAppointmentToCancel] = useState(null);
  const [cancelReason, setCancelReason] = useState("");
  const [showSellModal, setShowSellModal] = useState(false);
  const [petToSell, setPetToSell] = useState(null);
  const [prefillUserIdForSale, setPrefillUserIdForSale] = useState(null);
  const [isStatusUpdating, setIsStatusUpdating] = useState(false);

  const updateStatus = async (apptId, status, extraPayload = {}) => {
    setIsStatusUpdating(true);
    try {
      const token =
        localStorage.getItem("token") || sessionStorage.getItem("token");
      const res = await fetch(`${API_BASE_URL}/appointments/${apptId}/status`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          status,
          ...extraPayload,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success(`Appointment ${status} successfully`);
        if (selectedAppt?._id === apptId) {
          setSelectedAppt((prev) => ({
            ...prev,
            ...data,
          }));
        }
        if (status === "cancelled") {
          setShowCancelReasonModal(false);
          setAppointmentToCancel(null);
          setCancelReason("");
        }
        await fetchAppointments();
        setShowConfirmModal(false);
      } else {
        toast.error(data.message || "Failed to update status");
      }
    } catch {
      toast.error("Error updating status");
    } finally {
      setIsStatusUpdating(false);
    }
  };

  const handleCompleteClick = (appt) => {
    const isClientView =
      userRole === "user" || (user && appt.user?._id === user._id);
    if (isClientView) return;
    if (appt?.status === "completed" && !isWithinProviderEditWindow(appt)) {
      toast.error("Edit time limit expired");
      return;
    }
    const { providerName, providerSpec, providerAvatar } = getProviderInfo(
      appt,
      BASE_URL,
    );
    const displayAvatar = isClientView
      ? providerAvatar
      : getUserAvatar(appt, BASE_URL);
    setSelectedAppt({
      ...appt,
      providerName,
      providerSpec,
      providerAvatar,
      displayAvatar,
    });
    setModalMode("complete");
    setShowModal(true);
  };

  const handleViewClick = (appt) => {
    const isClientView =
      userRole === "user" || (user && appt.user?._id === user._id);
    const { providerName, providerSpec, providerAvatar } = getProviderInfo(
      appt,
      BASE_URL,
    );
    const displayAvatar = isClientView
      ? providerAvatar
      : getUserAvatar(appt, BASE_URL);
    setSelectedAppt({
      ...appt,
      providerName,
      providerSpec,
      providerAvatar,
      displayAvatar,
    });
    setModalMode("view");
    setShowModal(false);
  };

  const handleConfirmAppointmentClick = (apptId) => {
    setConfirmConfig({
      type: "confirm",
      title: "Confirm Appointment",
      message: "Are you sure you want to confirm this appointment?",
      confirmText: "Confirm",
      onConfirm: () => updateStatus(apptId, "confirmed"),
    });
    setShowConfirmModal(true);
  };

  const handleCancelAppointment = (appt) => {
    if (!appt?._id) return;
    const isClientView =
      userRole === "user" || (user && appt.user?._id === user._id);
    const isProviderView = !isClientView && isProvider;
    const cancelEligibility = getCancellationEligibility(
      appt,
      isClientView,
      isProviderView,
      userRole,
    );
    if (!cancelEligibility.canCancel) {
      toast.error(cancelEligibility.reason);
      return;
    }
    setAppointmentToCancel(appt);
    setCancelReason("");
    setShowCancelReasonModal(true);
  };

  const handleCancelWithReason = async () => {
    if (!appointmentToCancel?._id) return;
    const isClientView =
      userRole === "user" ||
      (user && appointmentToCancel.user?._id === user._id);
    const isProviderView = !isClientView && isProvider;
    const cancelEligibility = getCancellationEligibility(
      appointmentToCancel,
      isClientView,
      isProviderView,
      userRole,
    );
    if (!cancelEligibility.canCancel) {
      toast.error(cancelEligibility.reason);
      return;
    }
    const trimmedReason = cancelReason.trim();
    if (trimmedReason.length < 10) {
      toast.error("Please enter at least 10 characters for cancellation.");
      return;
    }
    await updateStatus(appointmentToCancel._id, "cancelled", {
      cancellationReason: trimmedReason,
    });
  };

  const handleCompletionSubmit = async (formData) => {
    setIsStatusUpdating(true);
    try {
      const token =
        localStorage.getItem("token") || sessionStorage.getItem("token");
      const res = await fetch(
        `${API_BASE_URL}/appointments/${selectedAppt._id}/status`,
        {
          method: "PUT",
          headers: { Authorization: `Bearer ${token}` },
          body: formData,
        },
      );
      if (res.status === 403) {
        const data = await res.json();
        toast.error(data.message || "Edit time limit expired");
        return;
      }
      if (res.ok) {
        toast.success("Consultation saved and appointment completed!");
        setShowModal(false);
        await fetchAppointments();
      } else {
        const data = await res.json();
        toast.error(data.message || "Failed to complete appointment");
      }
    } catch {
      toast.error("Error completing appointment");
    } finally {
      setIsStatusUpdating(false);
    }
  };

  const handleAssignPetClick = async (appt) => {
    if (!canAssignPetForAppointment(appt)) {
      toast.error("Only completed shop/NGO pet appointments can be assigned.");
      return;
    }

    try {
      const listingRef = getListingPetRef(appt);
      let listingPet =
        listingRef && typeof listingRef === "object" ? listingRef : null;

      if (!listingPet?._id && listingRef) {
        const listingPetId =
          typeof listingRef === "string"
            ? listingRef
            : listingRef?._id?.toString?.();
        if (listingPetId) {
          const token =
            localStorage.getItem("token") || sessionStorage.getItem("token");
          const res = await fetch(`${API_BASE_URL}/pets/${listingPetId}`, {
            headers: token ? { Authorization: `Bearer ${token}` } : undefined,
          });
          if (res.ok) listingPet = await res.json();
        }
      }

      if (!listingPet?._id) {
        toast.error("Pet listing details not found for this appointment");
        return;
      }

      if (listingPet.available === false) {
        toast.error("This pet is already sold or unavailable.");
        return;
      }

      setPetToSell(listingPet);
      setPrefillUserIdForSale(appt.user?._id || appt.user);
      setShowSellModal(true);
    } catch {
      toast.error("Unable to open assign pet flow right now.");
    }
  };

  return {
    activeTab,
    setActiveTab,
    selectedAppt,
    setSelectedAppt,
    showModal,
    setShowModal,
    modalMode,
    setModalMode,
    showConfirmModal,
    setShowConfirmModal,
    confirmConfig,
    setConfirmConfig,
    showCancelReasonModal,
    setShowCancelReasonModal,
    appointmentToCancel,
    setAppointmentToCancel,
    cancelReason,
    setCancelReason,
    showSellModal,
    setShowSellModal,
    petToSell,
    setPetToSell,
    prefillUserIdForSale,
    setPrefillUserIdForSale,
    isStatusUpdating,
    handleCompleteClick,
    handleViewClick,
    handleConfirmAppointmentClick,
    handleCancelAppointment,
    handleCancelWithReason,
    handleCompletionSubmit,
    handleAssignPetClick,
    updateStatus,
  };
};

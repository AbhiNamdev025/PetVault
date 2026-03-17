import React, { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { API_BASE_URL, BASE_URL } from "../../../../utils/constants";
import { PROFILE_SEARCH_EVENT } from "../../../../utils/profileSearch";
import FilterSidebar from "../../../common/FilterSidebar/FilterSidebar";
import styles from "./appointments.module.css";

// Sub-components
import AppointmentHeader from "./components/Layout/AppointmentHeader";
import AppointmentGrid from "./components/Layout/AppointmentGrid";
import AppointmentDetails from "./components/Layout/AppointmentDetails";
import AppointmentModals from "./components/Modals/AppointmentModals";
import AppointmentEmptyState from "./components/States/AppointmentEmptyState";
import AppointmentFilterSummary from "./components/Filters/AppointmentFilterSummary";

// Hooks
import { useAppointmentFiltering } from "./hooks/useAppointmentFiltering";
import { useAppointmentActions } from "./hooks/useAppointmentActions";

// Utils & Configs
import { getFilterOptions } from "./utils/appointmentConfigs";
import {
  formatTime,
  getProviderInfo,
  getUserAvatar,
  downloadPrescription,
  canAssignPetForAppointment,
  isWithinProviderEditWindow,
  getCancellationEligibility,
} from "./utils/appointmentUtils";
import { Button, Pagination } from "../../../common";

const Appointments = ({
  appointments,
  userRole,
  fetchAppointments,
  user,
  profileTab,
  setIsDetailsView,
}) => {
  const isProvider = [
    "doctor",
    "hospital",
    "shop",
    "daycare",
    "caretaker",
    "ngo",
  ].includes(userRole);

  const location = useLocation();
  const navigate = useNavigate();

  const {
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
  } = useAppointmentActions({
    userRole,
    user,
    isProvider,
    fetchAppointments,
    initialActiveTab: location.state?.appointmentTab || "upcoming",
  });

  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const isInitialMount = useRef(true);
  const [filters, setFilters] = useState(() => {
    return (
      location.state?.filters || {
        search: "",
        type: "all",
        status: "all",
      }
    );
  });

  const [currentPage, setCurrentPage] = useState(() => {
    return location.state?.currentPage || 1;
  });
  const ITEMS_PER_PAGE = 6;

  // Sync state to location.state to ensure persistence across navigations
  const updateNavigationState = (updates) => {
    navigate(location.pathname + location.search, {
      replace: true,
      state: {
        ...location.state,
        ...updates,
      },
    });
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
    updateNavigationState({ currentPage: page });
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setFilters({ search: "", type: "all", status: "all" });
    setCurrentPage(1);
    updateNavigationState({
      appointmentTab: tab,
      currentPage: 1,
      filters: { search: "", type: "all", status: "all" },
    });
  };

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
    setCurrentPage(1);
    updateNavigationState({
      filters: newFilters,
      currentPage: 1,
    });
  };

  const handleResetFilters = () => {
    const defaultFilters = { search: "", type: "all", status: "all" };
    setFilters(defaultFilters);
    setCurrentPage(1);
    updateNavigationState({
      filters: defaultFilters,
      currentPage: 1,
    });
  };

  // Restore state from navigation (e.g. coming back from pet profile)
  useEffect(() => {
    const state = location.state;
    if (
      state?.restoreAppt &&
      state?.appointmentId &&
      appointments.length > 0 &&
      !selectedAppt
    ) {
      const appt = appointments.find((a) => a._id === state.appointmentId);
      if (appt) {
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
        navigate(location.pathname + location.search, {
          replace: true,
          state: { ...location.state, restoreAppt: false },
        });
      }
    }
  }, [
    location.state,
    appointments,
    selectedAppt,
    userRole,
    user,
    navigate,
    location.pathname,
    location.search,
    setSelectedAppt,
    setModalMode,
    setShowModal,
  ]);

  // No longer need separate effects for resetting on tab/filter change as we handle it in handers
  // But we still need to set isInitialMount to false after first render
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
    }
  }, []);

  useEffect(() => {
    const handleProfileSearch = (event) => {
      const { query = "", targetTab = "" } = event.detail || {};
      if (targetTab && targetTab !== "appointments") return;
      setFilters((prev) => ({ ...prev, search: String(query || "") }));
    };
    window.addEventListener(PROFILE_SEARCH_EVENT, handleProfileSearch);
    return () =>
      window.removeEventListener(PROFILE_SEARCH_EVENT, handleProfileSearch);
  }, []);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchAppointments();
    setTimeout(() => setIsRefreshing(false), 500);
  };

  const { filteredAppointments, hasActiveFilters } = useAppointmentFiltering(
    appointments,
    activeTab,
    filters,
  );

  const totalPages = Math.ceil(filteredAppointments.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedAppointments = filteredAppointments.slice(
    startIndex,
    startIndex + ITEMS_PER_PAGE,
  );

  const selectedIsClientView =
    userRole === "user" || (user && selectedAppt?.user?._id === user._id);
  const selectedIsProviderView = !selectedIsClientView && isProvider;
  const selectedCancelEligibility = selectedAppt
    ? getCancellationEligibility(
        selectedAppt,
        selectedIsClientView,
        selectedIsProviderView,
        userRole,
      )
    : { canCancel: false, reason: "" };
  const canEditSelectedCompletedAppointment =
    selectedIsProviderView &&
    selectedAppt?.status === "completed" &&
    isWithinProviderEditWindow(selectedAppt);
  const canAssignSelectedPetToUser =
    selectedIsProviderView && canAssignPetForAppointment(selectedAppt);
  const showDetailsSection = selectedAppt && modalMode === "view";

  useEffect(() => {
    if (setIsDetailsView) {
      setIsDetailsView(showDetailsSection);
    }
  }, [showDetailsSection, setIsDetailsView]);

  const filterOptions = getFilterOptions(activeTab);

  return (
    <div className={styles.container}>
      <FilterSidebar
        isOpen={showFilters}
        onClose={() => setShowFilters(false)}
        filters={filters}
        setFilters={handleFilterChange}
        options={filterOptions}
        showSearch={false}
        onReset={handleResetFilters}
      />
      {showDetailsSection ? (
        <AppointmentDetails
          selectedAppt={selectedAppt}
          onBack={() => {
            setSelectedAppt(null);
            navigate(location.pathname + location.search, {
              replace: true,
              state: {
                ...location.state,
                appointmentId: undefined,
                restoreAppt: false,
                currentPage,
                appointmentTab: activeTab,
                filters,
              },
            });
          }}
          canEditResult={canEditSelectedCompletedAppointment}
          onEditResult={() => handleCompleteClick(selectedAppt)}
          canAssignPet={canAssignSelectedPetToUser}
          onAssignPet={() => handleAssignPetClick(selectedAppt)}
          isProviderView={selectedIsProviderView}
          onConfirm={handleConfirmAppointmentClick}
          onComplete={() => handleCompleteClick(selectedAppt)}
          isClientView={selectedIsClientView}
          onCancel={() => handleCancelAppointment(selectedAppt)}
          cancelEligibility={selectedCancelEligibility}
          userRole={userRole}
          profileTab={profileTab}
          currentPage={currentPage}
        />
      ) : (
        <>
          <div className={styles.sectionIntro}>
            <h2 className={styles.sectionTitle}>Appointments</h2>
            <p className={styles.sectionSubtitle}>
              {isProvider
                ? "Manage upcoming and past appointments for your services."
                : "Track your upcoming and past appointments in one place."}
            </p>
          </div>
          <AppointmentHeader
            activeTab={activeTab}
            onTabChange={handleTabChange}
            setShowFilters={setShowFilters}
            hasActiveFilters={hasActiveFilters}
            onClear={handleResetFilters}
            handleRefresh={handleRefresh}
            isRefreshing={isRefreshing}
          />
          <AppointmentFilterSummary
            count={filteredAppointments.length}
            hasActiveFilters={hasActiveFilters}
            onClear={() =>
              setFilters({ search: "", type: "all", status: "all" })
            }
          />

          <div className={styles.mainContent}>
            {filteredAppointments.length === 0 ? (
              <AppointmentEmptyState activeTab={activeTab} />
            ) : (
              <AppointmentGrid
                appointments={paginatedAppointments}
                userRole={userRole}
                user={user}
                isProvider={isProvider}
                activeTab={activeTab}
                handleConfirmAppointmentClick={handleConfirmAppointmentClick}
                handleCancelAppointment={handleCancelAppointment}
                handleCompleteClick={handleCompleteClick}
                handleViewClick={handleViewClick}
                handleAssignPetClick={handleAssignPetClick}
              />
            )}
          </div>

          {filteredAppointments.length > 0 && (
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
              showPageInfo={true}
              className={styles.pagination}
            />
          )}
        </>
      )}

      <AppointmentModals
        showModal={showModal}
        modalMode={modalMode}
        setShowModal={setShowModal}
        selectedAppt={selectedAppt}
        userRole={userRole}
        handleCompletionSubmit={handleCompletionSubmit}
        isStatusUpdating={isStatusUpdating}
        showConfirmModal={showConfirmModal}
        confirmConfig={confirmConfig}
        setShowConfirmModal={setShowConfirmModal}
        showCancelReasonModal={showCancelReasonModal}
        setShowCancelReasonModal={setShowCancelReasonModal}
        setAppointmentToCancel={setAppointmentToCancel}
        setCancelReason={setCancelReason}
        cancelReason={cancelReason}
        handleCancelWithReason={handleCancelWithReason}
        showSellModal={showSellModal}
        petToSell={petToSell}
        prefillUserIdForSale={prefillUserIdForSale}
        setShowSellModal={setShowSellModal}
        setPetToSell={setPetToSell}
        setPrefillUserIdForSale={setPrefillUserIdForSale}
        fetchAppointments={fetchAppointments}
      />
    </div>
  );
};

export default Appointments;

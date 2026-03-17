import React, { useEffect, useState, useCallback, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import toast from "react-hot-toast";
import styles from "./userProfile.module.css";
import { ProfileSkeleton } from "../Skeletons";
import Sidebar from "./components/Sidebar/sidebar";
import ProfileAppBar from "./components/ProfileAppBar/ProfileAppBar";
import MyPets from "./components/MyPets/myPets";
import Appointments from "./components/Appointments/appointments";
import { API_BASE_URL } from "../../utils/constants";
// Management Components
import ShopDashboard from "./components/Management/components/ShopManagement/components/ShopDashboard/ShopDashboard";
import SharedProviderManagement from "./components/Management/components/sharedProviderManagement";
import HospitalManagement from "./components/Management/components/HospitalManagement/hospitalManagement";
import DaycareManagement from "./components/Management/components/DaycareManagement/daycareManagement";
import NgoManagement from "./components/Management/components/NgoManagement/ngoManagement";
import ProfileInfo from "./components/ProfileInfo/profileInfo";
import ShopOrders from "./components/Orders/components/shopOrders/shopOrders";
import EditProfileForm from "./components/EditProfileForm/editProfileForm";
import AnalyticsDashboard from "./components/Management/components/Analytics/AnalyticsDashboard";
import Modal from "../common/Modal/Modal";
import Button from "../common/Button/Button";
import UserCoins from "./components/Coins/coins";
import Wallet from "./components/Wallet/wallet";
import Notifications from "./components/Notifications/notifications";
import { redirectToAuthHome } from "../../utils/authModalNavigation";
import { emitAuthStateChanged } from "../../utils/authState";
import { scrollAppToTop } from "../../utils/scroll";

import VerificationModal from "../Auth/VerificationModal/VerificationModal";

const UserProfile = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const location = useLocation();
  const [activeTab, setActiveTab] = useState(() => {
    const queryParams = new URLSearchParams(window.location.search);
    // Prefer state (for back nav) -> query param (for direct links) -> default
    return (
      window.history.state?.usr?.activeTab ||
      queryParams.get("tab") ||
      "profile"
    );
  });
  const [prefillPetId, setPrefillPetId] = useState(null);
  const [prefillPetTab, setPrefillPetTab] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [isDetailsView, setIsDetailsView] = useState(false);
  const [appointments, setAppointments] = useState([]);
  const [error, setError] = useState(null);
  const [editDays, setEditDays] = useState([]);
  const [newImages, setNewImages] = useState([]); // State for new images
  const [deletedImages, setDeletedImages] = useState([]); // State for deleted images
  const [showVerificationModal, setShowVerificationModal] = useState(false);
  const [tabRefreshKey, setTabRefreshKey] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get("showVerification") === "true") {
      setShowVerificationModal(true);
    }
  }, [location.search]);
  const initialRequestedTabRef = useRef(
    Boolean(
      location.state?.activeTab ||
      new URLSearchParams(location.search).get("tab"),
    ),
  );

  const fetchAppointments = useCallback(
    async (role) => {
      const providerRoles = [
        "doctor",
        "caretaker",
        "daycare",
        "hospital",
        "ngo",
        "shop",
      ];

      const isProvider = providerRoles.includes(role);

      if (role !== "user" && !isProvider) {
        setAppointments([]);
        return;
      }

      try {
        const token =
          localStorage.getItem("token") || sessionStorage.getItem("token");
        if (!token) {
          redirectToAuthHome(navigate, "login", "/profile");
          return;
        }

        const endpoint = isProvider
          ? `${API_BASE_URL}/appointments/provider-appointments?t=${Date.now()}`
          : `${API_BASE_URL}/appointments/my-appointments?t=${Date.now()}`;

        const response = await fetch(endpoint, {
          headers: { Authorization: `Bearer ${token}` },
          cache: "no-cache", // Added to ensure fresh data
        });

        if (!response.ok) {
          if (response.status === 404) {
            setAppointments([]);
            return;
          }
          throw new Error("Failed to fetch appointments");
        }

        const data = await response.json();
        // Ensure data is array
        if (Array.isArray(data)) {
          setAppointments(data);
        } else {
          console.error("Appointments data is not an array:", data);
          setAppointments([]);
        }
      } catch (error) {
        console.error("Error fetching appointments:", error);
        toast.error("Failed to load appointments.");
        setAppointments([]);
      }
    },
    [navigate],
  );

  const fetchUserData = useCallback(
    async ({ initTab = false } = {}) => {
      try {
        const token =
          localStorage.getItem("token") || sessionStorage.getItem("token");

        if (!token) {
          redirectToAuthHome(navigate, "login", "/profile");
          return null;
        }

        const response = await fetch(`${API_BASE_URL}/user/profile`, {
          headers: { Authorization: `Bearer ${token}` },
          cache: "no-cache",
        });

        if (!response.ok) {
          throw new Error("Failed to fetch profile");
        }

        const data = await response.json();
        setUser(data);

        if (initTab) {
          // Default initial landing tab for providers
          if (
            [
              "shop",
              "doctor",
              "hospital",
              "daycare",
              "caretaker",
              "ngo",
            ].includes(data.role)
          ) {
            setActiveTab("dashboard");
          }
        }

        return data;
      } catch (error) {
        console.error("Error fetching profile:", error);
        setError(error.message);
        toast.error("Failed to load profile. " + error.message);
        return null;
      } finally {
        setLoading(false);
      }
    },
    [navigate],
  );

  useEffect(() => {
    const init = async () => {
      const data = await fetchUserData({
        initTab: !initialRequestedTabRef.current && !location.state?.activeTab,
      });
      if (data?.role) {
        fetchAppointments(data.role);
      }
    };

    init();
  }, [fetchUserData, fetchAppointments]);

  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const requestedTab =
      location.state?.activeTab || queryParams.get("tab") || null;
    const requestedPetId =
      location.state?.selectedPetId || queryParams.get("petId") || null;
    const requestedPetTab =
      location.state?.selectedPetTab || queryParams.get("petTab") || null;

    if (!requestedTab && !requestedPetId && !requestedPetTab) return;
    // Only return if we've already applied this state AND we don't have a new search query
    // and we've already handled the initial mount request.
    if (
      location.state?.applied &&
      !location.search &&
      !initialRequestedTabRef.current
    )
      return;
    initialRequestedTabRef.current = false;

    if (requestedTab) {
      setActiveTab(requestedTab);
    }

    if (requestedPetId) {
      setPrefillPetId(requestedPetId);
    }

    if (requestedPetTab) {
      setPrefillPetTab(requestedPetTab);
    }

    navigate(
      {
        pathname: location.pathname,
        search: "",
      },
      {
        replace: true,
        state: { ...location.state, activeTab: requestedTab, applied: true },
      },
    );
  }, [location.state, location.search, location.pathname, navigate]);

  useEffect(() => {
    setTabRefreshKey((prev) => prev + 1);

    if (!user) return;

    if (activeTab === "appointments") {
      fetchAppointments(user.role);
    } else {
      fetchUserData();
    }
  }, [activeTab, user?.role, fetchAppointments, fetchUserData]);

  useEffect(() => {
    scrollAppToTop({ behavior: "auto" });
    const frame = window.requestAnimationFrame(() => {
      scrollAppToTop({ behavior: "auto" });
    });
    setIsDetailsView(false);
    return () => window.cancelAnimationFrame(frame);
  }, [activeTab]);

  useEffect(() => {
    if (user?.availability?.days) {
      setEditDays(user.availability.days);
    }
  }, [user]);

  // Sync tab changes to history state for better back-navigation support
  useEffect(() => {
    if (
      activeTab &&
      location.pathname === "/profile" &&
      location.state?.activeTab !== activeTab
    ) {
      navigate(location.pathname + location.search, {
        replace: true,
        state: { ...location.state, activeTab },
      });
    }
  }, [activeTab, navigate, location.pathname, location.search, location.state]);

  const handleUpdateProfile = async (formData) => {
    try {
      const token =
        localStorage.getItem("token") || sessionStorage.getItem("token");

      // Note: When sending FormData, do NOT set Content-Type manually.
      const response = await fetch(`${API_BASE_URL}/user/profile`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to update profile");
      }

      setUser(data);
      // Reset image states
      setNewImages([]);
      setDeletedImages([]);
      toast.success("Profile updated successfully!");
    } catch (error) {
      toast.error(error.message || "Failed to update profile");
    }
  };

  const getAvailableTabs = () => {
    if (!user) return [];

    const role = user.role;

    // 1. Profile always first
    const tabs = [{ id: "profile", label: "Profile" }];

    // 2. Dashboard (only for providers/shops)
    const isProviderOrShop = [
      "shop",
      "doctor",
      "hospital",
      "daycare",
      "caretaker",
      "ngo",
    ].includes(role);

    if (isProviderOrShop) {
      tabs.push({ id: "dashboard", label: "Dashboard" });
    }

    const shopType = user?.roleData?.shopType;
    // Management Tab Logic
    let showManagement = false;
    if (role === "shop") {
      // Grooming center does NOT see Management
      if (["petStore", "medicalStore", "mixed"].includes(shopType)) {
        showManagement = true;
      }
    } else if (["hospital", "daycare", "ngo"].includes(role)) {
      showManagement = true;
    }

    if (showManagement) {
      tabs.push({ id: "management", label: "Management" });
    }
    // 4. My Pets Tab - Show for everyone
    tabs.push({ id: "mypets", label: "My Pets" });

    // Orders Tab Logic - Promoted to Sidebar for Shops
    if (
      role === "shop" &&
      ["petStore", "medicalStore", "mixed", "groomingCenter"].includes(shopType)
    ) {
      tabs.push({ id: "orders", label: "Orders" });
    }

    // Appointments Tab Logic
    let showAppointments = false;
    if (role === "shop") {
      // Grooming, Mixed, AND PetStore see Appointments
      if (["groomingCenter", "mixed", "petStore"].includes(shopType)) {
        showAppointments = true;
      }
    } else if (
      ["caretaker", "daycare", "doctor", "hospital", "ngo", "user"].includes(
        role,
      )
    ) {
      showAppointments = true;
    }

    if (showAppointments) {
      tabs.push({ id: "appointments", label: "Appointments" });
    }
    // 3. Wallet (Moved right after Dashboard)
    tabs.push({ id: "wallet", label: "Wallet" });
    if (role === "user") {
      tabs.push({ id: "coins", label: "Coins" });
    }
    tabs.push({ id: "alerts", label: "Alerts" });
    return tabs;
  };

  const renderContent = () => {
    switch (activeTab) {
      case "profile":
        return (
          <ProfileInfo
            user={user}
            onEdit={() => setShowEditModal(true)}
            onUpdateUser={setUser}
            onVerificationClick={() => setShowVerificationModal(true)}
          />
        );

      case "appointments":
        return (
          <Appointments
            appointments={appointments}
            userRole={user.role}
            fetchAppointments={() => fetchAppointments(user.role)}
            user={user}
            profileTab={activeTab}
            setIsDetailsView={setIsDetailsView}
          />
        );

      case "mypets":
        return (
          <MyPets
            initialSelectedPetId={prefillPetId}
            initialSelectedPetTab={prefillPetTab}
            setIsDetailsView={setIsDetailsView}
            onInitialSelectionApplied={() => {
              setPrefillPetId(null);
              setPrefillPetTab(null);
            }}
          />
        );
      case "coins":
        return <UserCoins />;
      case "wallet":
        return <Wallet user={user} />;
      case "alerts":
        return <Notifications title="Notifications & Alerts" />;
      case "dashboard":
        return <AnalyticsDashboard user={user} setActiveTab={setActiveTab} />;

      case "orders":
        if (user.role === "shop") {
          return <ShopOrders user={user} setIsDetailsView={setIsDetailsView} />;
        }
        return <div>Orders not available</div>;

      case "management":
        switch (user.role) {
          case "shop":
            return <ShopDashboard user={user} />;
          case "doctor":
            return <SharedProviderManagement user={user} title="Doctor" />;
          case "caretaker":
            return <SharedProviderManagement user={user} title="Caretaker" />;
          case "daycare":
            return <DaycareManagement user={user} />;
          case "ngo":
            return <NgoManagement user={user} />;
          case "hospital":
            return <HospitalManagement user={user} />;
          default:
            return <div>Management Dashboard not available for this role</div>;
        }

      default:
        return <div>Select a tab</div>;
    }
  };

  if (loading) return <ProfileSkeleton />;
  if (error)
    return (
      <div className={styles.errorContainer}>
        <h2>Error Loading Profile</h2>
        <p>{error}</p>
        <Button
          variant="primary"
          onClick={() => window.location.reload()}
          className={styles.retryButton}
        >
          Retry
        </Button>
      </div>
    );
  if (!user) return <div>User not found</div>;

  const availableTabs = getAvailableTabs();

  const handleLogout = async () => {
    const token =
      localStorage.getItem("token") || sessionStorage.getItem("token");

    try {
      if (token && "serviceWorker" in navigator) {
        const registration = await navigator.serviceWorker.ready;
        const subscription = await registration.pushManager.getSubscription();

        if (subscription?.endpoint) {
          await fetch(`${API_BASE_URL}/notifications/unsubscribe`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ endpoint: subscription.endpoint }),
          });
        }
      }
    } catch (error) {
      console.error("Failed to unsubscribe push endpoint on logout:", error);
    } finally {
      localStorage.clear();
      sessionStorage.clear();
      emitAuthStateChanged({ status: "logged_out", source: "profile_sidebar" });
      navigate("/", { state: { openLogin: true } });
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.appBarWrapper}>
        <ProfileAppBar
          user={user}
          tabs={availableTabs}
          activeTab={activeTab}
          onTabChange={setActiveTab}
          onLogout={handleLogout}
          onBackToSite={() => navigate("/")}
          hideSearch={isDetailsView}
        />
      </div>
      <div className={styles.sidebarWrapper}>
        <Sidebar
          activeTab={activeTab}
          onTabChange={setActiveTab}
          tabs={availableTabs}
          onBackToSite={() => navigate("/")}
          onLogout={handleLogout}
        />
      </div>
      <div
        className={styles.contentWrapper}
        data-scroll-root="true"
        data-profile-search-root="true"
        key={`${activeTab}-${tabRefreshKey}`}
      >
        {renderContent()}
      </div>

      {showEditModal && (
        <Modal
          isOpen={showEditModal}
          onClose={() => setShowEditModal(false)}
          title="Edit Profile"
          className={styles.editProfileModal}
          contentClassName={styles.editProfileModalContent}
          hideContentPadding
          hideContentPaddingOnMobile
        >
          <EditProfileForm
            user={user}
            onUpdate={(updatedUser) => {
              setUser(updatedUser);
              setShowEditModal(false);
            }}
          />
        </Modal>
      )}
      {showVerificationModal && (
        <VerificationModal
          isOpen={showVerificationModal}
          onClose={() => setShowVerificationModal(false)}
          status={user.kycStatus}
          message={user.adminRemark}
          userId={user._id}
          onResubmit={fetchUserData}
        />
      )}
    </div>
  );
};

export default UserProfile;

import React, { useEffect, useState } from "react";
import { useNavigate, useOutletContext } from "react-router-dom";
import { API_BASE_URL } from "../../../utils/constants";
import styles from "./adminDashboard.module.css";
import { DashboardSkeleton } from "../../Skeletons";
import { toast } from "react-hot-toast";
import ApprovalModal from "../UserManagement/components/ApproveModal/ApprovalModal";
import RejectionModal from "../UserManagement/components/RejectionModal/RejectionModal";
import { ExternalLink, Filter } from "lucide-react";
import AdminHeader from "../common/AdminHeader/AdminHeader";
import MetricsGrid from "./components/MetricsGrid";
import RevenueTrends from "./components/RevenueTrends";
import KycQueue from "./components/KycQueue";
import DashboardSidebar from "./components/DashboardSidebar";
import PlatformFeeManager from "./components/PlatformFeeManager";
import Button from "../../common/Button/Button";

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [activities, setActivities] = useState([]);
  const [pendingApps, setPendingApps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [userToApprove, setUserToApprove] = useState(null);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [userToReject, setUserToReject] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { dashboardFilters, onOpenFilters } = useOutletContext();
  const navigate = useNavigate();

  useEffect(() => {
    fetchDashboardStats();
  }, [dashboardFilters]);

  const fetchDashboardStats = async () => {
    try {
      const token =
        localStorage.getItem("token") || sessionStorage.getItem("token");
      const range = dashboardFilters?.range || "lifetime";
      const response = await fetch(
        `${API_BASE_URL}/admin/dashboard?range=${range}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      if (response.ok) {
        const data = await response.json();
        setStats(data.stats);
        setPendingApps(data.pendingApplications || []);

        const combined = [
          ...(data.recentAppointments || []).map((a) => ({
            ...a,
            activityType: "appointment",
          })),
          ...(data.recentOrders || []).map((o) => ({
            ...o,
            activityType: "order",
          })),
        ].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

        setActivities(combined.slice(0, 5));
      }
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = (app, status) => {
    if (status === "approve") {
      setUserToApprove(app);
      setShowApproveModal(true);
    } else {
      setUserToReject(app);
      setShowRejectModal(true);
    }
  };

  const handleConfirmApprove = async () => {
    if (!userToApprove) return;
    setIsSubmitting(true);
    const loadingToast = toast.loading(`Approving ${userToApprove.name}...`);

    try {
      const token =
        localStorage.getItem("token") || sessionStorage.getItem("token");
      const response = await fetch(
        `${API_BASE_URL}/admin/users/${userToApprove._id}/approve`,
        {
          method: "PUT",
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      if (response.ok) {
        toast.success(`${userToApprove.name}'s application approved.`, {
          id: loadingToast,
        });
        fetchDashboardStats();
      } else {
        const error = await response.json();
        toast.error(error.message || "Failed to approve.", {
          id: loadingToast,
        });
      }
    } catch (error) {
      toast.error(`Error: ${error.message}`, { id: loadingToast });
    } finally {
      setIsSubmitting(false);
      setShowApproveModal(false);
      setUserToApprove(null);
    }
  };

  const handleConfirmReject = async (remark) => {
    if (!userToReject) return;
    setIsSubmitting(true);
    const loadingToast = toast.loading(`Rejecting ${userToReject.name}...`);

    try {
      const token =
        localStorage.getItem("token") || sessionStorage.getItem("token");
      const response = await fetch(
        `${API_BASE_URL}/admin/users/${userToReject._id}/reject`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ remark }),
        },
      );

      if (response.ok) {
        toast.success(`${userToReject.name}'s application rejected.`, {
          id: loadingToast,
        });
        fetchDashboardStats();
      } else {
        const error = await response.json();
        toast.error(error.message || "Failed to reject.", { id: loadingToast });
      }
    } catch (error) {
      toast.error(`Error: ${error.message}`, { id: loadingToast });
    } finally {
      setIsSubmitting(false);
      setShowRejectModal(false);
      setUserToReject(null);
    }
  };

  if (loading) return <DashboardSkeleton statsCount={5} />;

  return (
    <div className={styles.dashboardContainer}>
      <AdminHeader
        title="Admin Command Center"
        subtitle="Real-time platform insights and system management."
        actions={
          <Button
            variant="ghost"
            onClick={onOpenFilters}
            size="sm"
            leftIcon={<Filter size={14} />}
          >
            Filters
          </Button>
        }
      />

      <MetricsGrid stats={stats} onNavigate={navigate} />

      <div className={styles.mainLayout}>
        <div className={styles.leftCol}>
          <RevenueTrends
            dailyRevenue={stats?.dailyRevenue}
            range={dashboardFilters?.range || "lifetime"}
          />
          <KycQueue
            filteredApps={pendingApps}
            onViewAll={() => navigate("/admin/tenants")}
            onStatusUpdate={handleStatusUpdate}
            onRowClick={(app) => navigate(`/admin/tenants/${app._id}`)}
          />
          <PlatformFeeManager />
        </div>

        <DashboardSidebar
          pendingApps={pendingApps}
          activities={activities}
          onNavigate={navigate}
        />
      </div>

      {showApproveModal && (
        <ApprovalModal
          isOpen={showApproveModal}
          onClose={() => setShowApproveModal(false)}
          onConfirm={handleConfirmApprove}
          userName={userToApprove?.name}
          isLoading={isSubmitting}
        />
      )}

      {showRejectModal && (
        <RejectionModal
          isOpen={showRejectModal}
          onClose={() => setShowRejectModal(false)}
          onConfirm={handleConfirmReject}
          userName={userToReject?.name}
          isLoading={isSubmitting}
        />
      )}
    </div>
  );
};

export default AdminDashboard;

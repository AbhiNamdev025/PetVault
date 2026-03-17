import React, { useState, useEffect } from "react";
import {
  Mail,
  Send,
  Users,
  CheckCircle2,
  AlertCircle,
  Loader2,
} from "lucide-react";
import toast from "react-hot-toast";
import styles from "./adminNewsletter.module.css";
import { API_BASE_URL } from "../../../utils/constants";
import Button from "../../../components/common/Button/Button";
import Input from "../../../components/common/Input/Input";

const StatCard = ({ icon, label, value, trend }) => (
  <div className={styles.statCard}>
    <div className={styles.statIconWrapper}>{icon}</div>
    <div className={styles.statContent}>
      <h3 className={styles.statLabel}>{label}</h3>
      <div className={styles.statValue}>{value}</div>
      <p className={styles.statTrend}>{trend}</p>
    </div>
  </div>
);

const AdminNewsletter = () => {
  const [subscribersCount, setSubscribersCount] = useState(0);
  const [loadingCount, setLoadingCount] = useState(true);

  const [subject, setSubject] = useState("");
  const [content, setContent] = useState("");
  const [isSending, setIsSending] = useState(false);

  useEffect(() => {
    fetchSubscribers();
  }, []);

  const fetchSubscribers = async () => {
    try {
      const token =
        localStorage.getItem("token") || sessionStorage.getItem("token");
      const res = await fetch(`${API_BASE_URL}/newsletter/admin/subscribers`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setSubscribersCount(data.count || 0);
      }
    } catch (error) {
      console.error("Failed to fetch subscribers count:", error);
    } finally {
      setLoadingCount(false);
    }
  };

  const handleSendBroadcast = async (e) => {
    e.preventDefault();
    if (!subject.trim() || !content.trim()) {
      toast.error("Subject and content are required.");
      return;
    }

    if (subscribersCount === 0) {
      toast.error("No active subscribers to send to.");
      return;
    }

    setIsSending(true);

    try {
      const token =
        localStorage.getItem("token") || sessionStorage.getItem("token");
      const res = await fetch(`${API_BASE_URL}/newsletter/admin/send`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ subject, content }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        toast.success(data.message || "Emails sent successfully!");
        setSubject("");
        setContent("");
      } else {
        toast.error(data.message || "Failed to send emails.");
      }
    } catch (error) {
      console.error("Broadcast error:", error);
      toast.error("An error occurred while sending emails.");
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className={styles.newsletterContainer}>
      <div className={styles.header}>
        <div>
          <h1>Newsletter Broadcast</h1>
          <p>
            Send direct manual emails and updates to all your subscribed users.
          </p>
        </div>
      </div>

      <div className={styles.statsGrid}>
        <StatCard
          icon={<Users size={24} />}
          label="Active Subscribers"
          value={loadingCount ? "..." : subscribersCount}
          trend={
            +subscribersCount > 0 ? "Ready for Broadcast" : "No Subscribers"
          }
        />
        <StatCard
          icon={<Mail size={24} />}
          label="Automated Service"
          value="Monthly Tips"
          trend="Cron Job Active (1st of Month)"
        />
      </div>

      <div className={styles.broadcastPanel}>
        <div className={styles.panelHeader}>
          <h3>
            <Mail size={20} /> Compose Manual Email
          </h3>
          <span className={styles.badge}>Live Delivery</span>
        </div>

        <form onSubmit={handleSendBroadcast} className={styles.composeForm}>
          <div className={styles.formGroup}>
            <label>Subject Line</label>
            <Input
              type="text"
              placeholder="e.g. Exciting New PetVault Update!"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              disabled={isSending}
              required
            />
          </div>

          <div className={styles.formGroup}>
            <label>Email Body</label>
            <textarea
              className={styles.textArea}
              placeholder="Write your beautiful email content here..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              disabled={isSending}
              required
            />
          </div>

          <div className={styles.formActions}>
            <div className={styles.warningBox}>
              <AlertCircle size={20} />
              <span>
                This email will be delivered immediately to all{" "}
                <strong>{subscribersCount}</strong> active subscribers.
              </span>
            </div>
            <Button
              type="submit"
              variant="primary"
              disabled={isSending || subscribersCount === 0}
              className={styles.sendBtn}
            >
              {isSending ? (
                <>
                  <Loader2 className={styles.spin} size={18} /> Sending...
                </>
              ) : (
                <>
                  <Send size={18} /> Send Broadcast Now
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminNewsletter;

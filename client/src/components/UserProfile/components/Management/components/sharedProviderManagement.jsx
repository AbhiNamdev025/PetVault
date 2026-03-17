import React, { useState } from "react";
import toast from "react-hot-toast";
import styles from "./sharedProviderManagement.module.css";
import { API_BASE_URL } from "../../../../../utils/constants";
import { StickyNote, Clock, MapPin, Calendar, Save } from "lucide-react";
import {
  Input,
  Select,
  Button,
  Textarea,
  Switch,
} from "../../../../../components/common";
import { TIME_SLOTS } from "../../../../../utils/timeSlots";
const SharedProviderManagement = ({ user, title, onSuccess }) => {
  const hideServiceRadiusRoles = new Set([
    "doctor",
    "hospital",
    "daycare",
    "caretaker",
  ]);
  const shouldShowServiceRadius = !hideServiceRadiusRoles.has(
    String(user?.role || "").toLowerCase(),
  );
  const [loading, setLoading] = useState(false);
  const [availability, setAvailability] = useState({
    available: user.availability?.available || false,
    startTime: user.availability?.startTime || "09:00",
    endTime: user.availability?.endTime || "17:00",
    days: user.availability?.days || [],
    serviceRadius: user.availability?.serviceRadius || 0,
    statusNote: user.availability?.statusNote || "",
  });
  const weekDays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const handleDayToggle = (day) => {
    const isSelected = availability.days.some(
      (d) =>
        d.toLowerCase().startsWith(day.toLowerCase()) ||
        day.toLowerCase().startsWith(d.toLowerCase()),
    );
    if (isSelected) {
      setAvailability({
        ...availability,
        days: availability.days.filter(
          (d) =>
            !(
              d.toLowerCase().startsWith(day.toLowerCase()) ||
              day.toLowerCase().startsWith(d.toLowerCase())
            ),
        ),
      });
    } else {
      setAvailability({
        ...availability,
        days: [...availability.days, day],
      });
    }
  };
  const handleChange = (e) => {
    const value =
      e.target.type === "checkbox" ? e.target.checked : e.target.value;
    setAvailability({
      ...availability,
      [e.target.name]: value,
    });
  };
  const handleSave = async () => {
    setLoading(true);
    try {
      const token =
        localStorage.getItem("token") || sessionStorage.getItem("token");
      const response = await fetch(`${API_BASE_URL}/user/profile`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          availability,
        }),
      });
      if (!response.ok) throw new Error("Failed to update availability");
      const updatedUser = await response.json();
      toast.success("Availability settings saved!");
      if (onSuccess) onSuccess(updatedUser);
    } catch (error) {
      toast.error(error.message || "Failed to save settings");
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <div className={styles.statusToggle}>
            <Switch
              name="available"
              checked={availability.available}
              onChange={handleChange}
            />
            <span className={styles.statusLabel}>
              {availability.available ? "You are Online" : "You are Offline"}
            </span>
          </div>
        </div>
        <div className={styles.formGrid}>
          <div className={styles.fieldGroup}>
            <label className={styles.groupLabel}>
              <Clock size={16} /> Work Hours
            </label>
            <div className={styles.timeRow}>
              <div className={styles.inputWrapper}>
                <Select
                  label="Start Time"
                  name="startTime"
                  value={availability.startTime}
                  onChange={handleChange}
                  options={TIME_SLOTS}
                  fullWidth
                />
              </div>
              <div className={styles.inputWrapper}>
                <Select
                  label="End Time"
                  name="endTime"
                  value={availability.endTime}
                  onChange={handleChange}
                  options={TIME_SLOTS}
                  fullWidth
                />
              </div>
            </div>
          </div>

          {shouldShowServiceRadius && (
            <div className={styles.fieldGroup}>
              <label className={styles.groupLabel}>
                <MapPin size={16} /> Service Radius
              </label>
              <Input
                label="Distance (km)"
                type="number"
                name="serviceRadius"
                value={availability.serviceRadius}
                onChange={handleChange}
                placeholder="e.g. 10"
                fullWidth
              />
            </div>
          )}

          <div className={styles.fieldGroup}>
            <label className={styles.groupLabel}>
              <StickyNote size={16} /> Status Message
            </label>
            <Textarea
              name="statusNote"
              value={availability.statusNote}
              onChange={handleChange}
              placeholder="e.g. On vacation until Monday... available for emergency calls."
              fullWidth
              rows={3}
            />
          </div>
        </div>
        <div className={styles.daysSection}>
          <label className={styles.groupLabel}>
            <Calendar size={16} /> Available Days
          </label>
          <div className={styles.daysGrid}>
            {weekDays.map((day) => (
              <Button
                key={day}
                className={`${styles.dayBtn} ${availability.days.some((d) => d.toLowerCase().startsWith(day.toLowerCase()) || day.toLowerCase().startsWith(d.toLowerCase())) ? styles.activeDay : ""}`}
                onClick={() => handleDayToggle(day)}
                variant="primary"
                size="md"
              >
                {day}
              </Button>
            ))}
          </div>
        </div>
        <Button
          onClick={handleSave}
          disabled={loading}
          fullWidth
          size="lg"
          variant="primary"
        >
          {loading ? "Saving..." : "Save Settings"}
        </Button>
      </div>
    </div>
  );
};
export default SharedProviderManagement;

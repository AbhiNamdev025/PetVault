import React, { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import styles from "../adminDashboard.module.css";
import { API_BASE_URL, ROLE_OPTIONS } from "../../../../utils/constants";
import { Select, Button, Input } from "../../../common";
const PlatformFeeManager = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [defaultPercent, setDefaultPercent] = useState("2");
  const [roleOverrides, setRoleOverrides] = useState({});
  const [mode, setMode] = useState("global");
  const [selectedRole, setSelectedRole] = useState(ROLE_OPTIONS[0].id);
  const [overrideValue, setOverrideValue] = useState("");
  const availableRoles = useMemo(
    () => ROLE_OPTIONS.filter((role) => roleOverrides?.[role.id] === undefined),
    [roleOverrides],
  );
  const loadConfig = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/platform-fee`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to load");
      setDefaultPercent(
        data.defaultPercent !== undefined ? String(data.defaultPercent) : "2",
      );
      setRoleOverrides(data.roleOverrides || {});
      setMode(
        data.roleOverrides && Object.keys(data.roleOverrides).length > 0
          ? "custom"
          : "global",
      );
    } catch (error) {
      toast.error(error.message || "Failed to load platform fee");
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    loadConfig();
  }, []);
  useEffect(() => {
    if (availableRoles.length > 0) {
      setSelectedRole((prev) => {
        const stillValid = availableRoles.find((r) => r.id === prev);
        return stillValid ? prev : availableRoles[0].id;
      });
    }
  }, [availableRoles]);
  const handleAddOverride = () => {
    if (!selectedRole) return;
    const value = Number(overrideValue);
    if (overrideValue === "" || Number.isNaN(value)) {
      toast.error("Enter a valid percent");
      return;
    }
    if (value < 0 || value > 100) {
      toast.error("Percent must be between 0 and 100");
      return;
    }
    setRoleOverrides((prev) => ({
      ...prev,
      [selectedRole]: value,
    }));
    setOverrideValue("");
  };
  const handleRemoveOverride = (roleId) => {
    setRoleOverrides((prev) => {
      const next = {
        ...prev,
      };
      delete next[roleId];
      return next;
    });
  };
  const handleSave = async () => {
    setSaving(true);
    try {
      const token =
        localStorage.getItem("token") || sessionStorage.getItem("token");
      if (!token) {
        toast.error("Admin login required");
        return;
      }
      const payload = {
        defaultPercent: defaultPercent === "" ? 0 : Number(defaultPercent),
        roleOverrides: mode === "custom" ? roleOverrides : {},
      };
      const res = await fetch(`${API_BASE_URL}/platform-fee`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Update failed");
      toast.success("Platform fee updated");
      setDefaultPercent(String(data.defaultPercent));
      setRoleOverrides(data.roleOverrides || {});
      setMode(
        data.roleOverrides && Object.keys(data.roleOverrides).length > 0
          ? "custom"
          : "global",
      );
    } catch (error) {
      toast.error(error.message || "Failed to update platform fee");
    } finally {
      setSaving(false);
    }
  };
  return (
    <div className={styles.contentSection}>
      <div className={styles.sectionHeader}>
        <div className={styles.titleWithSub}>
          <h3>Platform Fee</h3>
          <p>Apply one fee for all roles or add custom overrides.</p>
        </div>
        <Button
          className={styles.btnView}
          onClick={handleSave}
          disabled={saving}
          variant="ghost"
          size="md"
        >
          {saving ? "Saving..." : "Save"}
        </Button>
      </div>

      {loading ? (
        <div className={styles.noData}>
          <p>Loading fee settings...</p>
        </div>
      ) : (
        <div className={styles.feeForm}>
          <div className={styles.feeRow}>
            <label className={styles.feeLabel}>Apply Platform Fee</label>
            <Select
              className={styles.feeSelect}
              value={mode}
              options={[
                {
                  value: "global",
                  label: "One fee for all roles",
                },
                {
                  value: "custom",
                  label: "Custom by role",
                },
              ]}
              onChange={(e) => setMode(e.target.value)}
            />
          </div>

          <div className={styles.feeRow}>
            <label className={styles.feeLabel}>Default Fee (%)</label>
            <Input
              className={styles.feeInput}
              type="number"
              min="0"
              max="100"
              step="0.1"
              value={defaultPercent}
              onChange={(e) => setDefaultPercent(e.target.value)}
            />
          </div>

          {mode === "custom" && (
            <>
              <div className={styles.feeHint}>
                Add role-specific fees. Default applies to others.
              </div>
              <div className={styles.feeRow}>
                <Select
                  className={styles.feeSelect}
                  value={selectedRole}
                  options={
                    availableRoles.length === 0
                      ? [
                          {
                            value: "",
                            label: "All roles covered",
                          },
                        ]
                      : availableRoles.map((role) => ({
                          value: role.id,
                          label: role.label,
                        }))
                  }
                  onChange={(e) => setSelectedRole(e.target.value)}
                  disabled={availableRoles.length === 0}
                />
                <Input
                  className={styles.feeInput}
                  type="number"
                  min="0"
                  max="100"
                  step="0.1"
                  value={overrideValue}
                  onChange={(e) => setOverrideValue(e.target.value)}
                  placeholder="%"
                />
                <Button
                  className={styles.btnApprove}
                  onClick={handleAddOverride}
                  disabled={availableRoles.length === 0}
                  variant="success"
                  size="md"
                >
                  Add
                </Button>
              </div>

              {Object.keys(roleOverrides).length > 0 && (
                <div className={styles.overrideList}>
                  {ROLE_OPTIONS.filter((role) =>
                    Object.prototype.hasOwnProperty.call(
                      roleOverrides,
                      role.id,
                    ),
                  ).map((role) => (
                    <div key={role.id} className={styles.overrideItem}>
                      <span className={styles.overrideLabel}>{role.label}</span>
                      <span className={styles.overrideValue}>
                        {roleOverrides[role.id]}%
                      </span>
                      <Button
                        className={styles.overrideRemove}
                        onClick={() => handleRemoveOverride(role.id)}
                        variant="danger"
                        size="md"
                      >
                        Remove
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
};
export default PlatformFeeManager;

import React, { useEffect, useState } from "react";
import styles from "./PetProfile.module.css";
import { API_BASE_URL } from "../../../../../utils/constants";
import FileViewerModal from "../../../../common/fileViewer/FileViewerModal";
import { Pill, ClipboardList } from "lucide-react";
import { Button } from "../../../../common";
const PetReports = ({
  petId
}) => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewFile, setViewFile] = useState(null);
  useEffect(() => {
    const fetchReports = async () => {
      try {
        const token = localStorage.getItem("token") || sessionStorage.getItem("token");
        if (!token || !petId) return;
        const res = await fetch(`${API_BASE_URL}/appointments/pet-history/${petId}`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        if (!res.ok) return;
        const data = await res.json();
        const list = Array.isArray(data?.history) ? data.history : [];
        const sorted = list.sort((a, b) => new Date(b.date) - new Date(a.date));
        setAppointments(sorted);
      } finally {
        setLoading(false);
      }
    };
    fetchReports();
  }, [petId]);
  if (loading) {
    return <div className={styles.empty}>Loading reports…</div>;
  }
  const parsePrescription = rawPrescription => {
    if (!rawPrescription) return [];
    try {
      const parsed = JSON.parse(rawPrescription);
      const list = Array.isArray(parsed) ? parsed : [parsed];
      return list.map(item => {
        if (typeof item === "string") return item.trim();
        return String(item?.medication || "").trim();
      }).filter(Boolean);
    } catch {
      return [String(rawPrescription).trim()].filter(Boolean);
    }
  };
  const prescriptionHistory = appointments.map(appt => ({
    ...appt,
    meds: parsePrescription(appt.prescription)
  })).filter(appt => appt.meds.length > 0);
  const reportHistory = appointments.filter(appt => appt.report);
  const getMedSummary = meds => {
    if (!meds.length) return "No medicines listed";
    if (meds.length <= 3) return meds.join(", ");
    return `${meds.slice(0, 3).join(", ")} +${meds.length - 3} more`;
  };
  return <>
      <div className={styles.historySection}>
        <h4 className={styles.historyTitle}>
          <Pill size={16} /> Prescription History
        </h4>
        {prescriptionHistory.length ? <div className={styles.reportList}>
            {prescriptionHistory.map(appt => <div key={`presc-${appt._id}`} className={styles.reportItem}>
                <div className={styles.reportContent}>
                  <p className={styles.reportTitle}>
                    {appt.service.toUpperCase()} ·{" "}
                    {new Date(appt.date).toLocaleDateString("en-IN")}
                  </p>
                  <span className={styles.reportMeta}>
                    {appt.providerId?.name || "Doctor"} ·{" "}
                    {appt.providerId?.role || appt.providerType}
                  </span>
                  <span className={styles.prescriptionSummary}>
                    {getMedSummary(appt.meds)}
                  </span>
                </div>
              </div>)}
          </div> : <div className={styles.empty}>No prescriptions found.</div>}
      </div>

      <div className={styles.historySection}>
        <h4 className={styles.historyTitle}>
          <ClipboardList size={16} /> Report Files
        </h4>
        {reportHistory.length ? <div className={styles.reportList}>
            {reportHistory.map(appt => <div key={`report-${appt._id}`} className={styles.reportItem}>
                <div className={styles.reportContent}>
                  <p className={styles.reportTitle}>
                    {appt.service.toUpperCase()} ·{" "}
                    {new Date(appt.date).toLocaleDateString("en-IN")}
                  </p>
                  <span className={styles.reportMeta}>
                    {appt.providerId?.name || "Doctor"} ·{" "}
                    {appt.providerId?.role || appt.providerType}
                  </span>
                </div>
                <Button className={styles.reportAction} onClick={() => setViewFile({
            file: {
              url: appt.report.startsWith("http") ? appt.report : `uploads/reports/${appt.report}`,
              fileName: "Medical Report",
              fileType: appt.report.toLowerCase().endsWith(".pdf") ? "pdf" : "image"
            }
          })} variant="primary" size="md">
                  View
                </Button>
              </div>)}
          </div> : <div className={styles.empty}>No report files uploaded yet.</div>}
      </div>

      {!prescriptionHistory.length && !reportHistory.length && <div className={styles.empty}>
          No prescription or report history found for this pet.
        </div>}

      {viewFile && <FileViewerModal file={viewFile} onClose={() => setViewFile(null)} />}
    </>;
};
export default PetReports;

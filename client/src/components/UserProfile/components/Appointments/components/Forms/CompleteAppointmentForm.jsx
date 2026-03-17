import React, { useState, useEffect } from "react";
import { Button } from "../../../../../common";
import styles from "../../appointments.module.css";
import {
  CA_PatientInfo,
  CA_Diagnosis,
  CA_Prescriptions,
  CA_Vaccinations,
  CA_Notes,
  CA_ServiceNotes,
} from "../CompleteAppointmentParts";

const createEmptyPrescription = () => ({
  medication: "",
  dosage: "",
  duration: "",
  frequency: "",
  timing: "",
  instructions: "",
});

const normalizePrescriptionEntry = (entry) => {
  if (entry && typeof entry === "object") {
    return {
      medication:
        entry.medication || entry.medicine || entry.name || entry.drug || "",
      dosage: entry.dosage || entry.dose || "",
      duration: entry.duration || "",
      frequency: entry.frequency || "",
      timing: entry.timing || entry.schedule || "",
      instructions:
        entry.instructions ||
        entry.instruction ||
        entry.notes ||
        entry.note ||
        "",
    };
  }

  return {
    ...createEmptyPrescription(),
    medication: String(entry || "").trim(),
  };
};

const getTodayDate = () => {
  const date = new Date();
  return new Date(date.getTime() - date.getTimezoneOffset() * 60000)
    .toISOString()
    .split("T")[0];
};

const CompleteAppointmentForm = ({
  selectedAppt,
  onSubmit,
  isSubmitting = false,
}) => {
  const [consultationData, setConsultationData] = useState({
    doctorNotes: "",
    diagnosis: "",
    followUpDate: getTodayDate(),
    serviceNotes: "",
  });

  const [prescriptions, setPrescriptions] = useState([
    createEmptyPrescription(),
  ]);

  const [vaccinations, setVaccinations] = useState([
    { name: "", date: getTodayDate(), nextDueDate: getTodayDate(), notes: "" },
  ]);

  const [reportFile, setReportFile] = useState(null);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (selectedAppt) {
      setConsultationData({
        doctorNotes: selectedAppt.doctorNotes || "",
        diagnosis: selectedAppt.diagnosis || "",
        followUpDate: selectedAppt.followUpDate
          ? selectedAppt.followUpDate.split("T")[0]
          : getTodayDate(), // Pre-fill today's date if not available
        serviceNotes: selectedAppt.serviceNotes || "",
      });

      if (selectedAppt.prescription) {
        try {
          const parsed = JSON.parse(selectedAppt.prescription);
          const normalized = (Array.isArray(parsed) ? parsed : [parsed])
            .map(normalizePrescriptionEntry)
            .filter(
              (item) =>
                item.medication ||
                item.dosage ||
                item.duration ||
                item.frequency ||
                item.timing ||
                item.instructions,
            );
          setPrescriptions(
            normalized.length > 0 ? normalized : [createEmptyPrescription()],
          );
        } catch {
          setPrescriptions([
            normalizePrescriptionEntry(selectedAppt.prescription),
          ]);
        }
      } else {
        setPrescriptions([createEmptyPrescription()]);
      }

      if (selectedAppt.vaccinations && selectedAppt.vaccinations.length > 0) {
        setVaccinations(selectedAppt.vaccinations);
      } else {
        setVaccinations([
          {
            name: "",
            date: getTodayDate(),
            nextDueDate: getTodayDate(),
            notes: "",
          },
        ]);
      }

      setReportFile(null);
      setErrors({});
    }
  }, [selectedAppt]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setConsultationData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handlePrescriptionChange = (index, field, value) => {
    const updated = [...prescriptions];
    updated[index][field] = value;
    setPrescriptions(updated);
    if (errors[`prescription_${index}_${field}`]) {
      setErrors((prev) => ({
        ...prev,
        [`prescription_${index}_${field}`]: "",
      }));
    }
  };

  const addPrescription = () => {
    setPrescriptions([...prescriptions, createEmptyPrescription()]);
  };

  const removePrescription = (index) => {
    setPrescriptions(prescriptions.filter((_, i) => i !== index));
    const newErrors = { ...errors };
    Object.keys(newErrors).forEach((key) => {
      if (key.startsWith(`prescription_${index}`)) {
        delete newErrors[key];
      }
    });
    setErrors(newErrors);
  };

  const handleVaccinationChange = (index, field, value) => {
    const updated = [...vaccinations];
    updated[index][field] = value;
    setVaccinations(updated);
    if (errors[`vaccination_${index}_${field}`]) {
      setErrors((prev) => ({ ...prev, [`vaccination_${index}_${field}`]: "" }));
    }
  };

  const addVaccination = () => {
    setVaccinations([
      ...vaccinations,
      {
        name: "",
        date: getTodayDate(),
        nextDueDate: getTodayDate(),
        notes: "",
      },
    ]);
  };

  const removeVaccination = (index) => {
    setVaccinations(vaccinations.filter((_, i) => i !== index));
    const newErrors = { ...errors };
    Object.keys(newErrors).forEach((key) => {
      if (key.startsWith(`vaccination_${index}`)) {
        delete newErrors[key];
      }
    });
    setErrors(newErrors);
  };

  const validateForm = () => {
    const newErrors = {};

    if (selectedAppt.service === "vet") {
      if (!consultationData.diagnosis.trim()) {
        newErrors.diagnosis = "Diagnosis is required";
      }

      prescriptions.forEach((p, index) => {
        const hasContent =
          p.medication ||
          p.dosage ||
          p.duration ||
          p.frequency ||
          p.timing ||
          p.instructions;
        if (hasContent) {
          if (!p.medication.trim()) {
            newErrors[`prescription_${index}_medication`] =
              "Medication name is required";
          }
        }
      });

      vaccinations.forEach((v, index) => {
        const hasContent =
          v.name.trim() ||
          v.notes.trim() ||
          v.date !== getTodayDate() ||
          v.nextDueDate !== getTodayDate();
        if (hasContent) {
          if (!v.name.trim()) {
            newErrors[`vaccination_${index}_name`] = "Vaccine name is required";
          }
          if (!v.date) {
            newErrors[`vaccination_${index}_date`] =
              "Vaccination date is required";
          }
        }
      });
    } else {
      if (!consultationData.serviceNotes.trim()) {
        newErrors.serviceNotes = "Service notes are required";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    const formData = new FormData();

    formData.append("status", "completed");
    formData.append("doctorNotes", consultationData.doctorNotes);
    formData.append("diagnosis", consultationData.diagnosis);
    formData.append("followUpDate", consultationData.followUpDate);
    formData.append("serviceNotes", consultationData.serviceNotes);
    const validPrescriptions = prescriptions.filter((p) => p.medication.trim());
    const validVaccinations = vaccinations.filter((v) => v.name.trim());

    formData.append("prescription", JSON.stringify(validPrescriptions));
    formData.append("vaccinations", JSON.stringify(validVaccinations));

    if (reportFile) {
      formData.append("report", reportFile);
    }

    onSubmit(formData);
  };

  return (
    <form
      id="complete-appointment-form"
      onSubmit={handleSubmit}
      className={styles.completionForm}
    >
      {/* Patient Context Section */}
      <CA_PatientInfo selectedAppt={selectedAppt} />

      {selectedAppt.service === "vet" ? (
        <>
          <CA_Diagnosis
            diagnosis={consultationData.diagnosis}
            onChange={handleInputChange}
            required={true}
            disabled={isSubmitting}
            error={errors.diagnosis}
          />

          <CA_Prescriptions
            prescriptions={prescriptions}
            onAdd={addPrescription}
            onRemove={removePrescription}
            onChange={handlePrescriptionChange}
            disabled={isSubmitting}
            errors={errors}
            maxLengthInstructions={1000} // Increased maxLength for instructions
          />

          <CA_Vaccinations
            vaccinations={vaccinations}
            onAdd={addVaccination}
            onRemove={removeVaccination}
            onChange={handleVaccinationChange}
            disabled={isSubmitting}
            errors={errors}
            getTodayDate={getTodayDate} // Pass getTodayDate to CA_Vaccinations
          />

          <CA_Notes
            doctorNotes={consultationData.doctorNotes}
            followUpDate={consultationData.followUpDate}
            onNotesChange={handleInputChange}
            onFileChange={(e) => setReportFile(e.target.files[0])}
            disabled={isSubmitting}
            errors={errors}
            getTodayDate={getTodayDate} // Pass getTodayDate to CA_Notes
            maxLengthNotes={2000} // Increased maxLength for doctorNotes
          />
        </>
      ) : (
        <CA_ServiceNotes
          serviceNotes={consultationData.serviceNotes}
          onChange={handleInputChange}
          disabled={isSubmitting}
          error={errors.serviceNotes}
          maxLength={2000} // Increased maxLength for serviceNotes
        />
      )}
    </form>
  );
};

export default CompleteAppointmentForm;

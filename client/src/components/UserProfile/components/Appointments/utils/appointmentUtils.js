import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import toast from "react-hot-toast";

export const formatTime = (timeStr) => {
  if (!timeStr) return "N/A";
  if (timeStr.includes("AM") || timeStr.includes("PM")) return timeStr;
  const [hours, minutes] = timeStr.split(":");
  const h = parseInt(hours);
  const ampm = h >= 12 ? "PM" : "AM";
  const formattedHours = h % 12 || 12;
  return `${formattedHours}:${minutes} ${ampm}`;
};

const toTitleCase = (value) =>
  String(value || "")
    .replace(/[_-]+/g, " ")
    .trim()
    .replace(/\b\w/g, (char) => char.toUpperCase());

export const getProviderInfo = (appt, BASE_URL) => {
  const provider = appt.providerId;
  const providerType = String(appt?.providerType || "").toLowerCase();
  const serviceLabel = toTitleCase(appt?.service || appt?.serviceType || "");

  const providerName =
    providerType === "doctor" || providerType === "hospital"
      ? provider?.roleData?.doctorName || provider?.name
      : providerType === "daycare"
        ? provider?.roleData?.daycareName ||
          provider?.businessName ||
          provider?.name
        : providerType === "shop"
          ? provider?.roleData?.shopName ||
            provider?.businessName ||
            provider?.name
          : providerType === "ngo"
            ? provider?.businessName || provider?.name
            : provider?.name;

  const providerSpec =
    providerType === "doctor" || providerType === "hospital"
      ? provider?.roleData?.doctorSpecialization || "Veterinary Consultation"
      : providerType === "daycare"
        ? serviceLabel ||
          provider?.roleData?.staffSpecialization ||
          provider?.roleData?.serviceType ||
          "Pet Care"
        : providerType === "caretaker"
          ? provider?.roleData?.staffSpecialization ||
            serviceLabel ||
            provider?.roleData?.serviceType ||
            "Pet Care"
          : serviceLabel ||
            provider?.roleData?.staffSpecialization ||
            provider?.roleData?.serviceType ||
            "Pet Service";

  const providerAvatar = provider?.avatar
    ? `${BASE_URL}/uploads/avatars/${provider.avatar}`
    : "https://www.shutterstock.com/image-vector/veterinarian-pets-smiling-male-doctor-260nw-2562782269.jpg";

  return { providerName, providerSpec, providerAvatar };
};

export const getUserAvatar = (appt, BASE_URL) => {
  if (appt.user?.avatar) {
    return `${BASE_URL}/uploads/avatars/${appt.user.avatar}`;
  }
  if (appt.userId?.avatar) {
    return `${BASE_URL}/uploads/avatars/${appt.userId.avatar}`;
  }
  return "https://upload.wikimedia.org/wikipedia/commons/9/99/Sample_User_Icon.png";
};

export const downloadPrescription = (appt, providerInfo) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const primaryColor = [124, 58, 237]; // Purple-600 (Main Brand)
  const secondaryColor = [71, 85, 105]; // Slate-600
  const footerReservedSpace = 28;
  const topMargin = 20;

  const normalizeCellText = (value) => {
    const text = String(value ?? "-");
    // Insert soft break opportunities in very long tokens so table layout stays stable.
    return text.replace(/(\S{24})(?=\S)/g, "$1 ");
  };

  const isMedical =
    appt.providerType === "doctor" || appt.providerType === "hospital";
  const titleText = isMedical ? "MEDICAL RECEIPT" : "APPOINTMENT SUMMARY";

  // 1. Header & Branding
  doc.setFillColor(...primaryColor);
  doc.rect(0, 0, pageWidth, 40, "F");

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(24);
  doc.setFont("helvetica", "bold");
  doc.text("PET VAULT", 20, 25);

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text("Professional Pet Care Services", 20, 32);

  doc.setFontSize(14);
  doc.text(titleText, pageWidth - 20, 27, { align: "right" });

  let yPos = 55;
  const ensureSpace = (requiredHeight = 16) => {
    if (yPos + requiredHeight > pageHeight - footerReservedSpace) {
      doc.addPage();
      yPos = topMargin;
    }
  };

  // 2. Summary Info Table
  autoTable(doc, {
    startY: yPos,
    theme: "plain",
    styles: {
      fontSize: 10,
      cellPadding: 3,
      valign: "middle",
      overflow: "linebreak",
    },
    columnStyles: {
      0: { fontStyle: "bold", cellWidth: 35, textColor: secondaryColor },
      1: { cellWidth: 50 },
      2: { fontStyle: "bold", cellWidth: 35, textColor: secondaryColor },
      3: { cellWidth: 50 },
    },
    body: [
      [
        "VISIT DATE:",
        new Date(appt.date)
          .toLocaleDateString("en-US", {
            day: "2-digit",
            month: "short",
            year: "numeric",
          })
          .toUpperCase(),
        "PROVIDER:",
        providerInfo.providerName || "N/A",
      ],
      [
        "TIME SLOT:",
        formatTime(appt.time),
        "SPECIALTY:",
        providerInfo.providerSpec || (appt.service || "General").toUpperCase(),
      ],
      [
        "RECEIPT ID:",
        `#${appt._id.slice(-6).toUpperCase()}`,
        "PET NAME:",
        appt.petName || appt.petId?.name || "N/A",
      ],
    ],
    margin: { left: 20, right: 20 },
  });

  yPos = doc.lastAutoTable.finalY + 15;

  // 2.5 Reason for Visit (Common to all)
  const reasonText = appt.reason || appt.healthIssues;
  if (reasonText) {
    const reasonLines = doc.splitTextToSize(reasonText, pageWidth - 40);
    ensureSpace(reasonLines.length * 5 + 20);

    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...secondaryColor);
    doc.text("REASON FOR VISIT", 20, yPos);
    yPos += 5;

    doc.setFont("helvetica", "normal");
    doc.setTextColor(40, 40, 40);
    doc.text(reasonLines, 20, yPos);
    yPos += reasonLines.length * 5 + 12;
  }

  // 3. Clinical Sections (Medical Only usually)
  if (appt.diagnosis) {
    const diagLines = doc.splitTextToSize(appt.diagnosis, pageWidth - 40);
    ensureSpace(diagLines.length * 5 + 20);

    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...secondaryColor);
    doc.text("DIAGNOSIS", 20, yPos);
    yPos += 5;

    doc.setFont("helvetica", "normal");
    doc.setTextColor(40, 40, 40);
    doc.text(diagLines, 20, yPos);
    yPos += diagLines.length * 5 + 12;
  }

  if (appt.doctorNotes) {
    const noteLines = doc.splitTextToSize(appt.doctorNotes, pageWidth - 40);
    ensureSpace(noteLines.length * 5 + 20);

    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...secondaryColor);
    doc.text("CLINICAL NOTES", 20, yPos);
    yPos += 5;

    doc.setFont("helvetica", "normal");
    doc.setTextColor(40, 40, 40);
    doc.text(noteLines, 20, yPos);
    yPos += noteLines.length * 5 + 12;
  }

  // 3.5 Service Notes (For Non-Medical)
  if (appt.serviceNotes) {
    const serviceLines = doc.splitTextToSize(appt.serviceNotes, pageWidth - 40);
    ensureSpace(serviceLines.length * 5 + 20);

    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...secondaryColor);
    doc.text("SERVICE NOTES", 20, yPos);
    yPos += 5;

    doc.setFont("helvetica", "normal");
    doc.setTextColor(40, 40, 40);
    doc.text(serviceLines, 20, yPos);
    yPos += serviceLines.length * 5 + 12;
  }

  // 4. Prescriptions Table
  if (appt.prescription) {
    let prescList = [];
    try {
      const parsed = JSON.parse(appt.prescription);
      prescList = Array.isArray(parsed) ? parsed : [parsed];
    } catch {
      if (appt.prescription && typeof appt.prescription === "string") {
        prescList = [{ medication: appt.prescription }];
      }
    }

    if (
      prescList.length > 0 &&
      (prescList[0].medication || prescList[0].name)
    ) {
      ensureSpace(26);

      doc.setFontSize(10);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(...secondaryColor);
      doc.text("PRESCRIPTIONS & MEDICATIONS", 20, yPos);
      yPos += 4;

      const medRows = prescList.map((m, i) => [
        i + 1,
        normalizeCellText(m.medication || m.name || m),
        normalizeCellText(m.dosage || "-"),
        normalizeCellText(m.duration || "-"),
        normalizeCellText(m.instructions || "-"),
      ]);

      autoTable(doc, {
        startY: yPos,
        head: [["#", "MEDICATION", "DOSAGE", "DURATION", "INSTRUCTIONS"]],
        body: medRows,
        theme: "striped",
        styles: {
          fontSize: 8,
          cellPadding: 2.5,
          overflow: "linebreak",
          valign: "top",
        },
        headStyles: {
          fillColor: primaryColor,
          textColor: 255,
          fontSize: 9,
          fontStyle: "bold",
          halign: "left",
          valign: "middle",
        },
        bodyStyles: { textColor: 50 },
        columnStyles: {
          0: { cellWidth: 10, halign: "center" },
          1: { cellWidth: 38, fontStyle: "bold", textColor: primaryColor },
          2: { cellWidth: 22 },
          3: { cellWidth: 24 },
          4: { cellWidth: "auto", fontStyle: "italic" },
        },
        tableWidth: "auto",
        rowPageBreak: "avoid",
        margin: { left: 20, right: 20 },
      });

      yPos = doc.lastAutoTable.finalY + 15;
    }
  }

  // 4.5 Vaccinations Table
  if (appt.vaccinations && appt.vaccinations.length > 0) {
    ensureSpace(24);

    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...secondaryColor);
    doc.text("VACCINATIONS", 20, yPos);
    yPos += 5;

    const vaccRows = appt.vaccinations.map((v, i) => [
      i + 1,
      v.name || "-",
      v.date
        ? new Date(v.date).toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "2-digit",
          })
        : "-",
      v.nextDueDate
        ? new Date(v.nextDueDate).toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "2-digit",
          })
        : "-",
    ]);

    autoTable(doc, {
      startY: yPos,
      head: [["#", "VACCINE", "VACCINATION DATE", "NEXT DUE DATE"]],
      body: vaccRows,
      theme: "striped",
      headStyles: {
        fillColor: primaryColor,
        textColor: 255,
        fontSize: 9,
        fontStyle: "bold",
      },
      bodyStyles: { fontSize: 8, textColor: 50 },
      columnStyles: {
        0: { cellWidth: 10, halign: "center" },
        1: { cellWidth: 45, fontStyle: "bold", textColor: primaryColor },
        2: { cellWidth: 45 },
        3: { cellWidth: "auto" },
      },
      margin: { left: 20, right: 20 },
    });

    yPos = doc.lastAutoTable.finalY + 15;
  }

  // 5. Follow-up
  if (appt.followUpDate) {
    ensureSpace(30);

    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.5);
    doc.line(20, yPos, pageWidth - 20, yPos);
    yPos += 10;

    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...primaryColor);
    doc.text("FOLLOW-UP INSTRUCTIONS", 20, yPos);
    yPos += 6;

    doc.setFont("helvetica", "normal");
    doc.setTextColor(40, 40, 40);
    doc.text(
      `Please visit again for a review on: ${new Date(appt.followUpDate).toLocaleDateString("en-US", { dateStyle: "long" })}`,
      20,
      yPos,
    );
    yPos += 15;
  }

  // 6. Footer
  ensureSpace(footerReservedSpace);
  const footerY = doc.internal.pageSize.getHeight() - 20;
  doc.setFontSize(8);
  doc.setTextColor(150, 150, 150);
  doc.text(
    "THIS IS A COMPUTER GENERATED RECORD. NO SIGNATURE REQUIRED.",
    pageWidth / 2,
    footerY,
    { align: "center" },
  );
  doc.text(
    `Generated on: ${new Date().toLocaleString()}`,
    pageWidth / 2,
    footerY + 5,
    { align: "center" },
  );
  doc.text(
    "© Pet Vault - Advanced Pet Care Management System",
    pageWidth / 2,
    footerY + 10,
    { align: "center" },
  );

  const fileName = `Receipt_${appt.petName || "Patient"}_${appt._id.slice(-6)}.pdf`;
  doc.save(fileName);
  toast.success("Receipt Downloaded Successfully!");
};

export const parseAppointmentDateTime = (appt) => {
  if (!appt?.date) return null;
  const baseDate = new Date(appt.date);
  if (Number.isNaN(baseDate.getTime())) return null;

  const parsedDateTime = new Date(baseDate);
  const rawTime = typeof appt.time === "string" ? appt.time.trim() : "";
  if (!rawTime) return parsedDateTime;

  const amPmMatch = rawTime.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
  const militaryMatch = rawTime.match(/^(\d{1,2}):(\d{2})$/);

  if (amPmMatch) {
    let hours = parseInt(amPmMatch[1], 10);
    const minutes = parseInt(amPmMatch[2], 10);
    const period = amPmMatch[3].toUpperCase();
    if (period === "PM" && hours !== 12) hours += 12;
    if (period === "AM" && hours === 12) hours = 0;
    parsedDateTime.setHours(hours, minutes, 0, 0);
    return parsedDateTime;
  }

  if (militaryMatch) {
    const hours = parseInt(militaryMatch[1], 10);
    const minutes = parseInt(militaryMatch[2], 10);
    parsedDateTime.setHours(hours, minutes, 0, 0);
  }

  return parsedDateTime;
};

export const getHoursUntilAppointment = (appt) => {
  const appointmentDateTime = parseAppointmentDateTime(appt);
  if (!appointmentDateTime) return Infinity;
  return (appointmentDateTime.getTime() - Date.now()) / (1000 * 60 * 60);
};

export const normalizeRole = (value) =>
  String(value || "")
    .trim()
    .toLowerCase();

export const isShopOrNgoAppointment = (appt) =>
  ["shop", "ngo"].includes(normalizeRole(appt?.providerType));

export const getListingPetRef = (appt) => appt?.enquiryPetId;

export const hasActiveListingPetRef = (appt) => {
  const listingRef = getListingPetRef(appt);
  if (!listingRef) return false;

  if (typeof listingRef === "object") {
    const listingId = listingRef?._id?.toString?.() || "";
    if (!listingId) return false;
    if (Object.prototype.hasOwnProperty.call(listingRef, "available")) {
      return Boolean(listingRef.available);
    }
    return true;
  }

  return Boolean(String(listingRef).trim());
};

export const canAssignPetForAppointment = (appt) =>
  Boolean(appt) &&
  appt.status === "completed" &&
  isShopOrNgoAppointment(appt) &&
  hasActiveListingPetRef(appt);

const PROVIDER_APPOINTMENT_EDIT_WINDOW_MS = 15 * 60 * 1000;

export const isWithinProviderEditWindow = (appt) => {
  if (!appt?.updatedAt) return false;
  const updatedAtMs = new Date(appt.updatedAt).getTime();
  if (!Number.isFinite(updatedAtMs)) return false;
  return Date.now() - updatedAtMs <= PROVIDER_APPOINTMENT_EDIT_WINDOW_MS;
};

export const getCancellationEligibility = (
  appt,
  isClientView,
  isProviderView,
  userRole,
) => {
  if (!appt || appt.status !== "pending") {
    return {
      canCancel: false,
      reason: "Only pending appointments can be cancelled.",
    };
  }

  const isPrepaidOnline =
    String(appt?.paymentMethod || "").toLowerCase() === "online" &&
    String(appt?.paymentStatus || "").toLowerCase() === "paid";
  if (isProviderView && isPrepaidOnline) {
    return {
      canCancel: false,
      reason: "Prepaid online appointments cannot be cancelled by provider.",
    };
  }

  const requiredLeadHours =
    isProviderView && ["doctor", "hospital"].includes(userRole) ? 48 : 24;
  const hoursUntil = getHoursUntilAppointment(appt);

  if (!Number.isFinite(hoursUntil)) {
    return {
      canCancel: true,
      reason: "",
    };
  }

  if (hoursUntil <= requiredLeadHours) {
    const roleText = isClientView
      ? "You can cancel only before 1 day of appointment time."
      : requiredLeadHours === 48
        ? "Doctor/hospital can cancel only before 2 days of appointment time."
        : "You can cancel only before 1 day of appointment time.";
    return {
      canCancel: false,
      reason: roleText,
    };
  }

  return {
    canCancel: true,
    reason: "",
  };
};

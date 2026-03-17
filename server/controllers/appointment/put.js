const Appointment = require("../../models/Appointment/appointment");
const {
  maybeAwardCoins,
  awardFirstCoins,
  refundSpentCoins,
} = require("../../utils/coins");
const UserPet = require("../../models/UserPet/userPet");
const { creditWallet, roundCurrency } = require("../../utils/wallet");

const updateAppointmentStatus = async (req, res) => {
  try {
    const existingApp = await Appointment.findById(req.params.id);

    if (!existingApp) {
      return res.status(404).json({ message: "Appointment not found" });
    }

    const requesterId = req.user?._id?.toString();
    const appointmentUserId = existingApp.user?.toString();
    const appointmentProviderId = existingApp.providerId?.toString();
    const isAdmin = req.user?.role === "admin";

    let allowedProviderIds = [requesterId];
    if (
      req.user?.role === "hospital" &&
      Array.isArray(req.user?.roleData?.hospitalDoctorIds)
    ) {
      allowedProviderIds = [
        ...allowedProviderIds,
        ...req.user.roleData.hospitalDoctorIds.map((id) => id.toString()),
      ];
    } else if (
      req.user?.role === "daycare" &&
      Array.isArray(req.user?.roleData?.daycareStaffIds)
    ) {
      allowedProviderIds = [
        ...allowedProviderIds,
        ...req.user.roleData.daycareStaffIds.map((id) => id.toString()),
      ];
    }

    const isOwnerUser =
      Boolean(requesterId) &&
      Boolean(appointmentUserId) &&
      requesterId === appointmentUserId;
    const isLinkedProvider =
      Boolean(appointmentProviderId) &&
      allowedProviderIds.includes(appointmentProviderId);

    if (!isAdmin && !isOwnerUser && !isLinkedProvider) {
      return res
        .status(403)
        .json({ message: "Not authorized to update this appointment" });
    }

    if (
      req.body.status &&
      !["pending", "confirmed", "completed", "cancelled"].includes(
        req.body.status,
      )
    ) {
      return res.status(400).json({ message: "Invalid appointment status" });
    }

    const actorType = isAdmin ? "admin" : isOwnerUser ? "user" : "provider";
    const isOnlineUnpaidAppointment =
      String(existingApp.paymentMethod || "").toLowerCase() === "online" &&
      String(existingApp.paymentStatus || "").toLowerCase() !== "paid";

    if (
      actorType === "provider" &&
      req.body.status === "confirmed" &&
      isOnlineUnpaidAppointment
    ) {
      return res.status(400).json({
        message:
          "Online appointment can be confirmed only after successful payment.",
      });
    }

    // 15-minute rule for provider-side edits after completion.
    if (actorType === "provider" && existingApp.status === "completed") {
      const timeDiff = Date.now() - new Date(existingApp.updatedAt).getTime();
      const fifteenMins = 15 * 60 * 1000;
      if (timeDiff > fifteenMins) {
        return res.status(403).json({
          message:
            "Resolution cannot be edited after 15 minutes of completion.",
        });
      }
    }

    const updateData = {
      status: req.body.status,
      doctorNotes: req.body.doctorNotes,
      diagnosis: req.body.diagnosis,
      prescription: req.body.prescription,
      followUpDate: req.body.followUpDate,
      serviceNotes: req.body.serviceNotes,
    };

    if (req.body.vaccinations) {
      try {
        updateData.vaccinations =
          typeof req.body.vaccinations === "string"
            ? JSON.parse(req.body.vaccinations)
            : req.body.vaccinations;
      } catch (e) {
        console.error("Error parsing vaccinations for appointment:", e);
      }
    }

    const isCancellingNow =
      req.body.status === "cancelled" && existingApp.status !== "cancelled";
    const requestedStatus = req.body.status || existingApp.status;
    const refundableCoins = Math.max(
      0,
      Number(existingApp.coinsUsed || 0) -
        Number(existingApp.coinsRefunded || 0),
    );
    const refundableOnlineToWallet = Math.max(
      0,
      Number(existingApp.totalAmount || 0) -
        Number(existingApp.onlineRefundedToWalletAmount || 0),
    );
    const shouldRefundCoins =
      requestedStatus === "cancelled" &&
      existingApp.status !== "completed" &&
      refundableCoins > 0;
    const shouldRefundOnlineToWallet =
      requestedStatus === "cancelled" &&
      existingApp.status !== "completed" &&
      String(existingApp.paymentMethod || "").toLowerCase() === "online" &&
      String(existingApp.paymentStatus || "").toLowerCase() === "paid" &&
      refundableOnlineToWallet > 0;
    const cancellationReason =
      typeof req.body.cancellationReason === "string"
        ? req.body.cancellationReason.trim()
        : "";

    if (isCancellingNow) {
      const isProviderCancellingPrepaidOnline =
        actorType === "provider" &&
        String(existingApp.paymentMethod || "").toLowerCase() === "online" &&
        String(existingApp.paymentStatus || "").toLowerCase() === "paid";
      if (isProviderCancellingPrepaidOnline) {
        return res.status(400).json({
          message:
            "Provider cannot cancel prepaid online appointments. Please contact admin support.",
        });
      }

      if (!isAdmin && cancellationReason.length < 10) {
        return res.status(400).json({
          message: "Cancellation reason is required (minimum 10 characters)",
        });
      }
      updateData.cancellationReason =
        cancellationReason || "Cancelled by admin.";
      updateData.cancelledBy = actorType;
      updateData.cancelledAt = new Date();
    }

    if (
      req.body.followUpDate &&
      (!existingApp.followUpDate ||
        new Date(existingApp.followUpDate).toISOString() !==
          new Date(req.body.followUpDate).toISOString())
    ) {
      updateData.followUpReminderSentAt = null;
    }

    if (req.file) {
      updateData.report = req.file.filename;
    }

    const hasPrescriptionContent = (raw) => {
      if (!raw) return false;
      try {
        const parsed = typeof raw === "string" ? JSON.parse(raw) : raw;
        const normalize = (value) =>
          typeof value === "string" ? value.trim() : "";
        if (Array.isArray(parsed)) {
          return parsed.some((item) => {
            if (!item || typeof item !== "object") return false;
            return (
              normalize(item.medication) ||
              normalize(item.dosage) ||
              normalize(item.duration) ||
              normalize(item.instructions)
            );
          });
        }
        if (parsed && typeof parsed === "object") {
          return (
            normalize(parsed.medication) ||
            normalize(parsed.dosage) ||
            normalize(parsed.duration) ||
            normalize(parsed.instructions)
          );
        }
        if (typeof parsed === "string") {
          return normalize(parsed) !== "";
        }
        return false;
      } catch {
        if (typeof raw === "string") {
          return raw.trim() !== "" && raw.trim() !== "[]";
        }
        return false;
      }
    };

    const prescriptionHasContent = hasPrescriptionContent(
      req.body.prescription,
    );
    const existingPrescriptionHasContent = hasPrescriptionContent(
      existingApp.prescription,
    );
    const prescriptionAdded =
      prescriptionHasContent && !existingPrescriptionHasContent;
    const reportAdded = Boolean(req.file) && !existingApp.report;

    const appointment = await Appointment.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true },
    )
      .populate("user", "name email phone")
      .populate("providerId", "name avatar role roleData")
      .populate("petId");

    if (shouldRefundCoins) {
      const targetUserId =
        appointment.user?._id || appointment.user || existingApp.user;
      if (targetUserId) {
        const refundResult = await refundSpentCoins({
          userId: targetUserId,
          coins: refundableCoins,
          sourceType: "appointment_refund",
          sourceId: appointment._id,
          spendSourceType: "appointment",
          note: `Refund for cancelled appointment ${appointment._id}`,
        });

        if (refundResult.coinsRefunded > 0) {
          appointment.coinsRefunded =
            Number(appointment.coinsRefunded || 0) + refundResult.coinsRefunded;
          appointment.coinsRefundedValue =
            Number(appointment.coinsRefundedValue || 0) +
            Number(refundResult.coinsValue || 0);
          appointment.coinsRefundedAt = new Date();
          await appointment.save();
        }
      }
    }

    if (shouldRefundOnlineToWallet) {
      const targetUserId =
        appointment.user?._id || appointment.user || existingApp.user;
      if (targetUserId) {
        const onlineRefundResult = await creditWallet({
          userId: targetUserId,
          amount: refundableOnlineToWallet,
          sourceType: "appointment_online_refund",
          sourceId: appointment._id,
          note: `Online payment refund for cancelled appointment ${appointment._id}`,
          dedupe: true,
        });

        if (onlineRefundResult.changed && onlineRefundResult.amount > 0) {
          appointment.onlineRefundedToWalletAmount = roundCurrency(
            Number(appointment.onlineRefundedToWalletAmount || 0) +
              onlineRefundResult.amount,
          );
          appointment.onlineRefundedToWalletAt = new Date();
          appointment.paymentStatus = "refunded";
          await appointment.save();
        }
      }
    }

    // Handle Vaccination Update (Upsert)
    // Handle Vaccinations Update (Upsert Array)
    if (req.body.vaccinations && appointment.petId) {
      let vaccinations = [];
      try {
        vaccinations = JSON.parse(req.body.vaccinations);
      } catch (e) {
        console.error("Error parsing vaccinations:", e);
      }

      if (Array.isArray(vaccinations) && vaccinations.length > 0) {
        const pet = await UserPet.findById(appointment.petId._id);
        if (pet) {
          vaccinations.forEach((vacc) => {
            if (!vacc.name) return;

            const existingIndex = pet.vaccinations.findIndex(
              (v) => v.name.toLowerCase() === vacc.name.toLowerCase(),
            );

            const payload = {
              name: vacc.name,
              date: vacc.date,
              nextDueDate: vacc.nextDueDate,
              administeredBy:
                vacc.administeredBy ||
                appointment.providerId?.name ||
                appointment.providerId?.roleData?.doctorName,
              doctorId: vacc.doctorId || appointment.providerId?._id,
              notes: vacc.notes,
            };

            if (existingIndex > -1) {
              // Update existing
              pet.vaccinations[existingIndex].date = payload.date;
              pet.vaccinations[existingIndex].nextDueDate = payload.nextDueDate;
              pet.vaccinations[existingIndex].administeredBy =
                payload.administeredBy;
              pet.vaccinations[existingIndex].doctorId = payload.doctorId;
              pet.vaccinations[existingIndex].notes = payload.notes;
            } else {
              // Add new
              pet.vaccinations.push(payload);
            }
          });
          await pet.save();
        }
      }
    }

    const { sendNotification } = require("../../utils/pushNotification");
    const providerIdStr = appointment.providerId?._id?.toString();
    const userIdStr = appointment.user?._id?.toString();
    const isProvider = actorType === "provider";
    const isUser = actorType === "user";
    const refundedValue = Number(appointment.coinsRefundedValue || 0);
    const onlineRefundedValue = Number(
      appointment.onlineRefundedToWalletAmount || 0,
    );
    const refundNote =
      refundedValue > 0 ? ` Coins refunded: ₹${refundedValue.toFixed(2)}.` : "";
    const onlineRefundNote =
      onlineRefundedValue > 0
        ? ` Online payment refunded to wallet: ₹${onlineRefundedValue.toFixed(2)}.`
        : "";
    const isAdoption =
      appointment.service === "pet_adoption" ||
      appointment.providerType === "ngo";
    const isDaycare =
      appointment.service === "daycare" ||
      appointment.providerType === "caretaker";

    // Send Notification on Status Change
    if (existingApp.status !== appointment.status) {
      if (isProvider) {
        // Provider updated it -> Notify User
        let type = null;
        let title = null;
        let body = null;

        if (isAdoption) {
          if (appointment.status === "confirmed") {
            type = "ADOPTION_APPROVED";
            title = "Adoption Approved";
            body = `Your adoption request for ${appointment.petName} has been approved.`;
          } else if (appointment.status === "cancelled") {
            type = "ADOPTION_REJECTED";
            title = "Adoption Rejected";
            body = `Your adoption request for ${appointment.petName} was rejected. Reason: ${appointment.cancellationReason || "Not provided."}${refundNote}${onlineRefundNote}`;
          } else if (appointment.status === "completed") {
            type = "ADOPTION_COMPLETED";
            title = "Adoption Completed";
            body = `Your adoption for ${appointment.petName} is completed.`;
          }
        } else if (isDaycare) {
          if (appointment.status === "confirmed") {
            type = "BOOKING_ACCEPTED";
            title = "Booking Accepted";
            body = `Your booking for ${appointment.petName} has been accepted.`;
          } else if (appointment.status === "cancelled") {
            type = "BOOKING_CANCELLED_BY_PROVIDER";
            title = "Booking Cancelled";
            body = `Your booking for ${appointment.petName} was cancelled by the provider. Reason: ${appointment.cancellationReason || "Not provided."}${refundNote}${onlineRefundNote}`;
          } else if (appointment.status === "completed") {
            type = "SERVICE_COMPLETED";
            title = "Service Completed";
            body = `Service for ${appointment.petName} has been completed.`;
          }
        } else {
          if (appointment.status === "confirmed") {
            type = "BOOKING_CONFIRMED";
            title = "Booking Confirmed";
            body = `Your appointment for ${appointment.petName} has been confirmed.`;
          } else if (appointment.status === "cancelled") {
            type = "BOOKING_CANCELLED_BY_PROVIDER";
            title = "Booking Cancelled";
            body = `Your appointment for ${appointment.petName} was cancelled by the provider. Reason: ${appointment.cancellationReason || "Not provided."}${refundNote}${onlineRefundNote}`;
          } else if (appointment.status === "completed") {
            type = "APPOINTMENT_COMPLETED";
            title = "Appointment Completed";
            body = `Your appointment for ${appointment.petName} is completed.`;
          }
        }

        if (type && userIdStr && userIdStr !== requesterId) {
          await sendNotification(appointment.user._id, {
            title,
            body,
            icon: "/pwa-192x192.png",
            type,
            data: { url: `/my-appointments` },
          });
        }
      } else if (isUser && appointment.status === "cancelled") {
        // User updated it (e.g. cancelled) -> Notify Provider
        if (providerIdStr && providerIdStr !== requesterId) {
          await sendNotification(appointment.providerId._id, {
            title: "Booking Cancelled",
            body: `An appointment with ${appointment.user.name} was cancelled by the user. Reason: ${appointment.cancellationReason || "Not provided."}`,
            icon: "/pwa-192x192.png",
            type: "BOOKING_CANCELLED_BY_USER",
            data: { url: `/profile` },
          });
        }
      }
    }

    if (
      existingApp.status !== appointment.status &&
      appointment.status === "completed"
    ) {
      const userId = appointment.user?._id || appointment.user;

      if (userId) {
        const countFilter = isAdoption
          ? {
              user: userId,
              status: "completed",
              _id: { $ne: appointment._id },
              $or: [{ service: "pet_adoption" }, { providerType: "ngo" }],
            }
          : {
              user: userId,
              status: "completed",
              _id: { $ne: appointment._id },
              service: { $ne: "pet_adoption" },
              providerType: { $ne: "ngo" },
            };

        const previousCompleted = await Appointment.countDocuments(countFilter);

        if (previousCompleted === 0) {
          await awardFirstCoins({
            userId,
            category: isAdoption ? "adoption" : "appointment",
            sourceId: appointment._id,
            note: isAdoption
              ? "First adoption completion bonus"
              : "First appointment completion bonus",
          });
        }
      }

      await maybeAwardCoins({
        userId,
        sourceType: "appointment",
        sourceId: appointment._id,
        baseAmount: appointment.originalAmount || appointment.totalAmount,
        note: `Reward for completed appointment ${appointment._id}`,
      });
    }

    if (
      (prescriptionAdded || reportAdded) &&
      appointment.user?._id &&
      userIdStr !== requesterId
    ) {
      await sendNotification(appointment.user._id, {
        title: "Prescription Uploaded",
        body: "Your prescription has been uploaded by the provider.",
        icon: "/pwa-192x192.png",
        type: "PRESCRIPTION_UPLOADED",
        data: { url: `/my-appointments` },
      });
    }

    res.json(appointment);
  } catch (error) {
    console.error(
      "Error in server/controllers/appointment/put.js (updateAppointmentStatus):",
      error,
    );
    res.status(500).json({ message: error.message });
  }
};

module.exports = { updateAppointmentStatus };

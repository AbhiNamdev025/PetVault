const UserPet = require("../models/UserPet/userPet");
const Appointment = require("../models/Appointment/appointment");
const { sendNotification } = require("./pushNotification");
const {
  autoCancelUnansweredAppointments,
} = require("../controllers/appointment/utils");

const readPositiveInt = (value, fallback) => {
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
};

const DAY_MS = 24 * 60 * 60 * 1000;
const AUTO_CANCEL_INTERVAL_MINUTES = readPositiveInt(
  process.env.AUTO_CANCEL_CHECK_INTERVAL_MINUTES,
  1,
);
const REMINDER_INTERVAL_HOURS = readPositiveInt(
  process.env.REMINDER_RUN_INTERVAL_HOURS,
  6,
);
const AUTO_CANCEL_INTERVAL_MS = AUTO_CANCEL_INTERVAL_MINUTES * 60 * 1000;
const REMINDER_INTERVAL_MS = REMINDER_INTERVAL_HOURS * 60 * 60 * 1000;

const startOfDay = (date) =>
  new Date(date.getFullYear(), date.getMonth(), date.getDate());

const formatDate = (date) =>
  new Date(date).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

const processVaccinationReminders = async () => {
  const now = new Date();
  const today = startOfDay(now);
  const windowEnd = new Date(today.getTime() + 7 * DAY_MS);

  const pets = await UserPet.find({
    status: "active",
    "vaccinations.nextDueDate": { $exists: true, $ne: null, $lte: windowEnd },
  }).select("owner name vaccinations");

  for (const pet of pets) {
    let dirty = false;

    for (const vacc of pet.vaccinations || []) {
      if (!vacc?.nextDueDate || !vacc?.name) continue;

      const dueDate = startOfDay(new Date(vacc.nextDueDate));
      const diffDays = Math.round((dueDate - today) / DAY_MS);

      let stage = null;
      if (diffDays <= -7) stage = "overdue";
      else if (diffDays <= 0) stage = "due";
      else if (diffDays <= 1) stage = "1d";
      else if (diffDays <= 7) stage = "7d";

      if (!stage) continue;

      const lastStage = vacc.lastReminderStage;
      const lastAt = vacc.lastReminderAt
        ? startOfDay(new Date(vacc.lastReminderAt))
        : null;

      if (lastStage === stage) {
        if (stage !== "overdue") {
          continue;
        }
        if (
          lastAt &&
          today.getTime() - lastAt.getTime() < 7 * DAY_MS
        ) {
          continue;
        }
      }

      await sendNotification(pet.owner, {
        title: "Vaccination Reminder",
        body: `${pet.name}'s ${vacc.name} is ${
          diffDays < 0 ? "overdue" : "due"
        } on ${formatDate(dueDate)}.`,
        icon: "/pwa-192x192.png",
        type: "VACCINATION_REMINDER",
        data: {
          url: "/profile",
          tab: "mypets",
          petId: pet._id,
          vaccine: vacc.name,
          dueDate,
        },
      });

      vacc.lastReminderAt = now;
      vacc.lastReminderStage = stage;
      dirty = true;
    }

    if (dirty) {
      await pet.save();
    }
  }
};

const processFollowUpReminders = async () => {
  const now = new Date();
  const today = startOfDay(now);
  const windowEnd = new Date(today.getTime() + 2 * DAY_MS);

  const appointments = await Appointment.find({
    followUpDate: { $gte: today, $lte: windowEnd },
    status: { $ne: "cancelled" },
  }).select("user petName followUpDate followUpReminderSentAt");

  for (const appointment of appointments) {
    if (!appointment.user || !appointment.followUpDate) continue;

    const lastAt = appointment.followUpReminderSentAt
      ? startOfDay(new Date(appointment.followUpReminderSentAt))
      : null;

    if (lastAt && today.getTime() === lastAt.getTime()) {
      continue;
    }

    await sendNotification(appointment.user, {
      title: "Follow-up Reminder",
      body: `Your follow-up for ${appointment.petName} is on ${formatDate(
        appointment.followUpDate,
      )}.`,
      icon: "/pwa-192x192.png",
      type: "FOLLOWUP_REMINDER",
      data: { url: "/profile", tab: "appointments", appointmentId: appointment._id },
    });

    appointment.followUpReminderSentAt = now;
    await appointment.save();
  }
};

const startReminderScheduler = () => {
  if (process.env.ENABLE_REMINDER_SCHEDULER === "false") return;

  const runAutoCancel = async () => {
    try {
      await autoCancelUnansweredAppointments();
    } catch (error) {
      console.error("Auto-cancel scheduler error:", error);
    }
  };

  const runReminderJobs = async () => {
    try {
      await processVaccinationReminders();
      await processFollowUpReminders();
    } catch (error) {
      console.error("Reminder scheduler error:", error);
    }
  };

  runAutoCancel();
  runReminderJobs();
  setInterval(runAutoCancel, AUTO_CANCEL_INTERVAL_MS);
  setInterval(runReminderJobs, REMINDER_INTERVAL_MS);
};

module.exports = {
  startReminderScheduler,
  processVaccinationReminders,
  processFollowUpReminders,
};

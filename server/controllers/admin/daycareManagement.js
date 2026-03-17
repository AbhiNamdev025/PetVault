const User = require("../../models/User/user");

/**
 * Get all daycares with metrics
 */
const getAllDaycares = async (req, res) => {
  try {
    const daycares = await User.find({ role: "daycare" }).select(
      "name email phone roleData.daycareName roleData.daycareDescription roleData.daycareStaffIds roleData.maxPetsAllowed createdAt",
    );

    const daycaresWithMetrics = await Promise.all(
      daycares.map(async (daycare) => {
        // Count caretakers pointing to this daycare
        const directStaffCount = await User.countDocuments({
          role: "caretaker",
          "roleData.daycareId": daycare._id,
        });

        const explicitStaffIds = daycare.roleData?.daycareStaffIds || [];
        const caretakerCount = Math.max(
          directStaffCount,
          explicitStaffIds.length,
        );

        return {
          _id: daycare._id,
          owner_name: daycare.name,
          owner_email: daycare.email,
          owner_phone: daycare.phone,
          daycare_name: daycare.roleData?.daycareName || "N/A",
          daycare_description: daycare.roleData?.daycareDescription || "",
          caretaker_count: caretakerCount,
          max_pets_allowed: daycare.roleData?.maxPetsAllowed || 0,
          registered_date: daycare.createdAt,
        };
      }),
    );

    res.json({
      success: true,
      count: daycaresWithMetrics.length,
      daycares: daycaresWithMetrics,
    });
  } catch (error) {
    console.error(
      "Error in server/controllers/admin/daycareManagement.js (getAllDaycares):",
      error,
    );
    res.status(500).json({ message: error.message });
  }
};

/**
 * Get daycare details with caretakers
 */
const getDaycareDetails = async (req, res) => {
  try {
    const { isValidObjectId } = require("mongoose");
    if (!isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: "Invalid daycare ID" });
    }

    const daycare = await User.findOne({
      _id: req.params.id,
      role: "daycare",
    })
      .select("name email phone roleData createdAt")
      .populate(
        "roleData.daycareStaffIds",
        "name email roleData availability isArchived",
      );

    if (!daycare) {
      return res.status(404).json({ message: "Daycare not found" });
    }

    // Get caretakers: combine those in array and those pointing to this daycareId
    const explicitStaffIds = daycare.roleData?.daycareStaffIds || [];
    const directStaff = await User.find({
      role: "caretaker",
      "roleData.daycareId": daycare._id,
    }).select("name email roleData availability isArchived");

    // Merge and deduplicate
    const combinedStaff = [...explicitStaffIds];
    directStaff.forEach((ds) => {
      if (
        !combinedStaff.find((cs) => cs._id.toString() === ds._id.toString())
      ) {
        combinedStaff.push(ds);
      }
    });

    // Format caretakers with their details
    const caretakers = combinedStaff.map((caretaker) => ({
      _id: caretaker._id,
      name: caretaker.name,
      email: caretaker.email,
      specialization: caretaker.roleData?.staffSpecialization || "General",
      experience: caretaker.roleData?.staffExperience || 0,
      hourly_rate: caretaker.roleData?.hourlyRate || 0,
      image: caretaker.roleData?.caretakerImages?.[0] || null,
      availability: {
        available: caretaker.availability?.available || false,
        start_time: caretaker.availability?.startTime || "",
        end_time: caretaker.availability?.endTime || "",
        days: caretaker.availability?.days || [],
      },
      isArchived: caretaker.isArchived,
    }));

    // Calculate Lifetime Earnings
    const Appointment = require("../../models/Appointment/appointment");
    let totalEarnings = 0;
    for (const caretaker of combinedStaff) {
      const caretakerCompletedAppointments = await Appointment.countDocuments({
        providerId: caretaker._id,
        providerType: "caretaker",
        status: "completed",
      });
      const rate = caretaker.roleData?.hourlyRate || 0;
      totalEarnings += caretakerCompletedAppointments * rate;
    }

    res.json({
      success: true,
      daycare: {
        _id: daycare._id,
        owner_name: daycare.name,
        owner_email: daycare.email,
        owner_phone: daycare.phone,
        daycare_name: daycare.roleData?.daycareName || "N/A",
        daycare_description: daycare.roleData?.daycareDescription || "",
        daycare_images: daycare.roleData?.daycareImages || [],
        max_pets_allowed: daycare.roleData?.maxPetsAllowed || 0,
        registered_date: daycare.createdAt,
        lifetime_earning: totalEarnings,
      },
      caretakers: {
        count: caretakers.length,
        list: caretakers,
      },
      lifetime_earning: totalEarnings,
    });
  } catch (error) {
    console.error(
      "Error in server/controllers/admin/daycareManagement.js (getDaycareDetails):",
      error,
    );
    res.status(500).json({ message: error.message });
  }
};

/**
 * Get daycare caretakers (view-only)
 */
const getDaycareCaretakers = async (req, res) => {
  try {
    const { isValidObjectId } = require("mongoose");
    if (!isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: "Invalid daycare ID" });
    }

    const daycare = await User.findOne({
      _id: req.params.id,
      role: "daycare",
    })
      .select("name roleData.daycareName roleData.daycareStaffIds")
      .populate("roleData.daycareStaffIds", "name email roleData availability");

    if (!daycare) {
      return res.status(404).json({ message: "Daycare not found" });
    }

    const caretakers = (daycare.roleData?.daycareStaffIds || []).map(
      (caretaker) => ({
        _id: caretaker._id,
        name: caretaker.name,
        email: caretaker.email,
        specialization: caretaker.roleData?.staffSpecialization || "General",
        experience: caretaker.roleData?.staffExperience || 0,
        hourly_rate: caretaker.roleData?.hourlyRate || 0,
        availability: {
          available: caretaker.availability?.available || false,
          start_time: caretaker.availability?.startTime || "",
          end_time: caretaker.availability?.endTime || "",
          days: caretaker.availability?.days || [],
          status_note: caretaker.availability?.statusNote || "",
        },
      }),
    );

    res.json({
      success: true,
      daycare_id: daycare._id,
      daycare_name: daycare.roleData?.daycareName || daycare.name,
      count: caretakers.length,
      caretakers: caretakers,
    });
  } catch (error) {
    console.error(
      "Error in server/controllers/admin/daycareManagement.js (getDaycareCaretakers):",
      error,
    );
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getAllDaycares,
  getDaycareDetails,
  getDaycareCaretakers,
};

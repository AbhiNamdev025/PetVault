const User = require("../../models/User/user");
const Appointment = require("../../models/Appointment/appointment");

/**
 * Get all hospitals with metrics
 */
const getAllHospitals = async (req, res) => {
  try {
    const hospitals = await User.find({ role: "hospital" }).select(
      "name email phone roleData.hospitalName roleData.hospitalDescription roleData.hospitalDoctorIds createdAt",
    );

    const hospitalsWithMetrics = await Promise.all(
      hospitals.map(async (hospital) => {
        // Count doctors pointing to this hospital
        const directDoctorCount = await User.countDocuments({
          role: "doctor",
          "roleData.hospitalId": hospital._id,
        });

        const explicitDoctorIds = hospital.roleData?.hospitalDoctorIds || [];
        const doctorCount = Math.max(
          directDoctorCount,
          explicitDoctorIds.length,
        );

        // Get appointment count for this hospital's doctors
        const doctorIds =
          explicitDoctorIds.length > 0
            ? explicitDoctorIds
            : (
                await User.find({
                  role: "doctor",
                  "roleData.hospitalId": hospital._id,
                }).select("_id")
              ).map((d) => d._id);

        const appointmentCount = await Appointment.countDocuments({
          providerId: { $in: doctorIds },
          providerType: "doctor",
        });

        return {
          _id: hospital._id,
          owner_name: hospital.name,
          owner_email: hospital.email,
          owner_phone: hospital.phone,
          hospital_name: hospital.roleData?.hospitalName || "N/A",
          hospital_description: hospital.roleData?.hospitalDescription || "",
          doctor_count: doctorCount,
          total_appointments: appointmentCount,
          registered_date: hospital.createdAt,
        };
      }),
    );

    res.json({
      success: true,
      count: hospitalsWithMetrics.length,
      hospitals: hospitalsWithMetrics,
    });
  } catch (error) {
    console.error(
      "Error in server/controllers/admin/hospitalManagement.js (getAllHospitals):",
      error,
    );
    res.status(500).json({ message: error.message });
  }
};

/**
 * Get hospital details with doctors and analytics
 */
const getHospitalDetails = async (req, res) => {
  try {
    const { isValidObjectId } = require("mongoose");
    if (!isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: "Invalid hospital ID" });
    }

    const hospital = await User.findOne({
      _id: req.params.id,
      role: "hospital",
    })
      .select("name email phone roleData createdAt")
      .populate("roleData.hospitalDoctorIds", "name email roleData isArchived");

    if (!hospital) {
      return res.status(404).json({ message: "Hospital not found" });
    }

    const doctorIds =
      hospital.roleData?.hospitalDoctorIds?.map((d) => d._id) || [];

    // Get appointment analytics
    const totalAppointments = await Appointment.countDocuments({
      providerId: { $in: doctorIds },
      providerType: "doctor",
    });

    const pendingAppointments = await Appointment.countDocuments({
      providerId: { $in: doctorIds },
      providerType: "doctor",
      status: "pending",
    });

    const confirmedAppointments = await Appointment.countDocuments({
      providerId: { $in: doctorIds },
      providerType: "doctor",
      status: "confirmed",
    });

    const completedAppointments = await Appointment.countDocuments({
      providerId: { $in: doctorIds },
      providerType: "doctor",
      status: "completed",
    });

    const cancelledAppointments = await Appointment.countDocuments({
      providerId: { $in: doctorIds },
      providerType: "doctor",
      status: "cancelled",
    });

    // Get recent appointments
    const recentAppointments = await Appointment.find({
      providerId: { $in: doctorIds },
      providerType: "doctor",
    })
      .sort({ createdAt: -1 })
      .limit(10)
      .populate("providerId", "name roleData.doctorSpecialization")
      .select("petName petType date time status createdAt");

    // Get doctors: combine those in array and those pointing to this hospitalId
    const explicitDoctorIds = hospital.roleData?.hospitalDoctorIds || [];
    const directDoctors = await User.find({
      role: "doctor",
      "roleData.hospitalId": hospital._id,
    }).select("name email roleData isArchived");

    // Merge and deduplicate
    const combinedDoctors = [...explicitDoctorIds];
    directDoctors.forEach((dd) => {
      if (
        !combinedDoctors.find((cd) => cd._id.toString() === dd._id.toString())
      ) {
        combinedDoctors.push(dd);
      }
    });

    // Format doctors with their appointment counts
    const doctorsWithMetrics = await Promise.all(
      combinedDoctors.map(async (doctor) => {
        const doctorAppointments = await Appointment.countDocuments({
          providerId: doctor._id,
          providerType: "doctor",
        });

        const activeAppointments = await Appointment.countDocuments({
          providerId: doctor._id,
          providerType: "doctor",
          status: { $in: ["pending", "confirmed"] },
        });

        return {
          _id: doctor._id,
          name: doctor.name,
          email: doctor.email,
          specialization: doctor.roleData?.doctorSpecialization || "General",
          experience: doctor.roleData?.doctorExperience || 0,
          consultation_fee: doctor.roleData?.consultationFee || 0,
          total_appointments: doctorAppointments,
          active_appointments: activeAppointments,
          image: doctor.roleData?.doctorImages?.[0] || null,
          isArchived: doctor.isArchived,
        };
      }),
    );

    // Calculate Lifetime Earnings
    let totalEarnings = 0;
    for (const doctor of combinedDoctors) {
      const doctorCompletedAppointments = await Appointment.countDocuments({
        providerId: doctor._id,
        providerType: "doctor",
        status: "completed",
      });
      const fee = doctor.roleData?.consultationFee || 0;
      totalEarnings += doctorCompletedAppointments * fee;
    }

    res.json({
      success: true,
      hospital: {
        _id: hospital._id,
        owner_name: hospital.name,
        owner_email: hospital.email,
        owner_phone: hospital.phone,
        hospital_name: hospital.roleData?.hospitalName || "N/A",
        hospital_description: hospital.roleData?.hospitalDescription || "",
        hospital_images: hospital.roleData?.hospitalImages || [],
        hospital_services: hospital.roleData?.hospitalServices || [],
        registered_date: hospital.createdAt,
        lifetime_earning: totalEarnings,
      },
      doctors: {
        count: doctorsWithMetrics.length,
        list: doctorsWithMetrics,
      },
      analytics: {
        total_appointments: totalAppointments,
        pending: pendingAppointments,
        confirmed: confirmedAppointments,
        completed: completedAppointments,
        cancelled: cancelledAppointments,
        lifetime_earning: totalEarnings,
      },
      recent_appointments: recentAppointments,
    });
  } catch (error) {
    console.error(
      "Error in server/controllers/admin/hospitalManagement.js (getHospitalDetails):",
      error,
    );
    res.status(500).json({ message: error.message });
  }
};

/**
 * Get hospital doctors (view-only)
 */
const getHospitalDoctors = async (req, res) => {
  try {
    const { isValidObjectId } = require("mongoose");
    if (!isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: "Invalid hospital ID" });
    }

    const hospital = await User.findOne({
      _id: req.params.id,
      role: "hospital",
    })
      .select("name roleData.hospitalName roleData.hospitalDoctorIds")
      .populate("roleData.hospitalDoctorIds", "name email roleData");

    if (!hospital) {
      return res.status(404).json({ message: "Hospital not found" });
    }

    const doctorsWithMetrics = await Promise.all(
      (hospital.roleData?.hospitalDoctorIds || []).map(async (doctor) => {
        const totalAppointments = await Appointment.countDocuments({
          providerId: doctor._id,
          providerType: "doctor",
        });

        const activeAppointments = await Appointment.countDocuments({
          providerId: doctor._id,
          providerType: "doctor",
          status: { $in: ["pending", "confirmed"] },
        });

        const todayStart = new Date();
        todayStart.setHours(0, 0, 0, 0);
        const todayEnd = new Date();
        todayEnd.setHours(23, 59, 59, 999);

        const todayAppointments = await Appointment.countDocuments({
          providerId: doctor._id,
          providerType: "doctor",
          date: { $gte: todayStart, $lte: todayEnd },
        });

        return {
          _id: doctor._id,
          name: doctor.name,
          email: doctor.email,
          specialization: doctor.roleData?.doctorSpecialization || "General",
          experience: doctor.roleData?.doctorExperience || 0,
          consultation_fee: doctor.roleData?.consultationFee || 0,
          qualifications: doctor.roleData?.doctorQualifications || {},
          total_appointments: totalAppointments,
          active_appointments: activeAppointments,
          today_appointments: todayAppointments,
        };
      }),
    );

    res.json({
      success: true,
      hospital_id: hospital._id,
      hospital_name: hospital.roleData?.hospitalName || hospital.name,
      count: doctorsWithMetrics.length,
      doctors: doctorsWithMetrics,
    });
  } catch (error) {
    console.error(
      "Error in server/controllers/admin/hospitalManagement.js (getHospitalDoctors):",
      error,
    );
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getAllHospitals,
  getHospitalDetails,
  getHospitalDoctors,
};

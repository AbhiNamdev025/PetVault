const Order = require("../../models/Order/order");
const Appointment = require("../../models/Appointment/appointment");
const User = require("../../models/User/user");
const mongoose = require("mongoose");

const getProviderStats = async (req, res) => {
  try {
    const userId = req.user._id;
    const role = req.user.role;
    const user = await User.findById(userId);

    const stats = {
      totalEarnings: 0,
      totalAppointments: 0,
      completedAppointments: 0,
      pendingAppointments: 0,
      cancelledAppointments: 0,
      earningsData: [],
      appointmentsData: [],
      staffCount: 0,
      totalOrders: 0,
      completedOrders: 0,
    };

    // 0. Identify All Providers (Self + Staff)
    let allProviderIds = [userId];
    if (role === "hospital" && user.roleData?.hospitalDoctorIds) {
      allProviderIds = [...allProviderIds, ...user.roleData.hospitalDoctorIds];
      stats.staffCount = user.roleData.hospitalDoctorIds.length;
    } else if (role === "daycare" && user.roleData?.daycareStaffIds) {
      allProviderIds = [...allProviderIds, ...user.roleData.daycareStaffIds];
      stats.staffCount = user.roleData.daycareStaffIds.length;
    }

    // 1. Calculate Earnings & Orders (Shop Only - Self Only usually)
    if (role === "shop") {
      const shopOrders = await Order.aggregate([
        { $unwind: "$items" },
        {
          $match: {
            "items.shopId": new mongoose.Types.ObjectId(userId),
          },
        },
        {
          $group: {
            _id: null,
            totalRevenue: {
              $sum: {
                $cond: [
                  { $eq: ["$status", "delivered"] },
                  { $multiply: ["$items.price", "$items.quantity"] },
                  0,
                ],
              },
            },
            totalCount: { $sum: 1 },
            completedCount: {
              $sum: { $cond: [{ $eq: ["$status", "delivered"] }, 1, 0] },
            },
            pendingCount: {
              $sum: { $cond: [{ $eq: ["$status", "pending"] }, 1, 0] },
            },
          },
        },
      ]);

      if (shopOrders.length > 0) {
        stats.totalEarnings = shopOrders[0].totalRevenue || 0;
        stats.totalOrders = shopOrders[0].totalCount || 0;
        stats.completedOrders = shopOrders[0].completedCount || 0;
      }
    }

    // 2. Fetch Providers & Rates
    const allProviders = await User.find({ _id: { $in: allProviderIds } });
    const providerRates = {};
    allProviders.forEach((p) => {
      let rate = 0;
      if (p.role === "doctor") rate = p.roleData?.consultationFee || 0;
      else if (p.role === "caretaker") rate = p.roleData?.hourlyRate || 0;
      else if (p.role === "shop") rate = p.roleData?.hourlyRate || 0;
      providerRates[p._id.toString()] = rate;
    });

    // 3. Fetch Appointments (Aggregated)
    const appointments = await Appointment.find({
      providerId: { $in: allProviderIds },
    });

    stats.totalAppointments = appointments.length;
    stats.completedAppointments = appointments.filter(
      (a) => a.status === "completed",
    ).length;
    stats.pendingAppointments = appointments.filter(
      (a) => a.status === "pending",
    ).length;
    stats.cancelledAppointments = appointments.filter(
      (a) => a.status === "cancelled",
    ).length;

    // 4. Calculate Appointment Earnings
    // Iterate completed appointments and sum up rate based on provider
    let appointmentEarnings = 0;
    appointments.forEach((app) => {
      if (app.status === "completed") {
        const pId = app.providerId.toString();
        const rate = providerRates[pId] || 0;
        appointmentEarnings += rate;
      }
    });

    stats.totalEarnings += appointmentEarnings;

    // 5. Generate Monthly Graph Data (Last 6 Months)
    const months = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      months.push({
        name: d.toLocaleString("default", { month: "short" }),
        month: d.getMonth(),
        year: d.getFullYear(),
        earnings: 0,
        appointments: 0,
      });
    }

    // Populate Graph Data
    // - From Appointments
    appointments.forEach((app) => {
      if (app.status === "completed") {
        const date = new Date(app.date);
        const monthEntry = months.find(
          (m) => m.month === date.getMonth() && m.year === date.getFullYear(),
        );
        if (monthEntry) {
          monthEntry.appointments += 1;
          const pId = app.providerId.toString();
          const rate = providerRates[pId] || 0;
          monthEntry.earnings += rate;
        }
      }
    });

    // - From Orders (Shop)
    if (role === "shop") {
      const allShopItems = await Order.aggregate([
        { $unwind: "$items" },
        {
          $match: {
            "items.shopId": new mongoose.Types.ObjectId(userId),
            status: "delivered",
          },
        },
        {
          $project: {
            createdAt: 1,
            amount: { $multiply: ["$items.price", "$items.quantity"] },
          },
        },
      ]);

      allShopItems.forEach((item) => {
        const date = new Date(item.createdAt);
        const monthEntry = months.find(
          (m) => m.month === date.getMonth() && m.year === date.getFullYear(),
        );
        if (monthEntry) {
          monthEntry.earnings += item.amount;
        }
      });
    }

    stats.graphData = months.map(({ name, earnings, appointments }) => ({
      name,
      earnings,
      appointments,
    }));

    res.status(200).json(stats);
  } catch (error) {
    console.error(
      "Error in server/controllers/analytics/get.js (getProviderStats):",
      error,
    );
    res.status(500).json({ message: "Failed to fetch analytics" });
  }
};

module.exports = { getProviderStats };

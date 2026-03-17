const User = require("../../models/User/user");
const Pet = require("../../models/Pet/pet");
const Product = require("../../models/Product/product");
const Appointment = require("../../models/Appointment/appointment");
const Order = require("../../models/Order/order");
const {
  getPlatformFeeConfig,
  getPlatformFeePercent,
  roundCurrency,
} = require("../../utils/platformFee");

const getDashboardStats = async (req, res) => {
  try {
    const { range = "lifetime" } = req.query;

    let orderFilter = {
      status: { $in: ["confirmed", "shipped", "delivered"] },
    };
    let appFilter = { status: { $in: ["confirmed", "completed"] } };
    let platformRangeFilter = {};

    if (range !== "lifetime") {
      const now = new Date();
      let startDate;
      if (range === "today") startDate = new Date(now.setHours(0, 0, 0, 0));
      else if (range === "week")
        startDate = new Date(now.setDate(now.getDate() - 7));
      else if (range === "month")
        startDate = new Date(now.setMonth(now.getMonth() - 1));

      if (startDate) {
        orderFilter.updatedAt = { $gte: startDate };
        appFilter.updatedAt = { $gte: startDate };
        platformRangeFilter.createdAt = { $gte: startDate };
      }
    }

    const totalUsers = await User.countDocuments();
    const activeTenants = await User.countDocuments({
      role: { $in: ["shop", "hospital", "ngo", "daycare"] },
    });
    const activeDoctors = await User.countDocuments({ role: "doctor" });
    const totalPets = await Pet.countDocuments();
    const totalProducts = await Product.countDocuments();
    const totalOrders = await Order.countDocuments(
      range === "lifetime" ? {} : platformRangeFilter,
    );

    const platformConfig = await getPlatformFeeConfig();

    // Recalculate Cutoff and Revenue based on actual roles
    const activeOrders = await Order.find(orderFilter).populate(
      "items.shopId",
      "role",
    );
    const orderStats = activeOrders.reduce(
      (acc, order) => {
        let rev = 0;
        let fee = 0;
        order.items.forEach((item) => {
          const itemRev = (item.price || 0) * (item.quantity || 1);
          // If shopId wasn't populated or missing, default to shop
          const role = item.shopId?.role || "shop";
          const feePercent = getPlatformFeePercent(role, platformConfig);
          rev += itemRev;
          fee += (itemRev * feePercent) / 100;
        });
        return {
          revenue: acc.revenue + rev,
          fee: acc.fee + fee,
        };
      },
      { revenue: 0, fee: 0 },
    );

    const activeAppointments = await Appointment.find(appFilter).populate(
      "providerId",
      "role roleData",
    );
    const appStats = activeAppointments.reduce(
      (acc, app) => {
        const rev = app.totalAmount || 0;
        const role = app.providerId?.role || app.providerType || "doctor";
        const feePercent = getPlatformFeePercent(role, platformConfig);
        const fee = (rev * feePercent) / 100;
        return {
          revenue: acc.revenue + rev,
          fee: acc.fee + fee,
        };
      },
      { revenue: 0, fee: 0 },
    );

    const totalRevenue = roundCurrency(orderStats.revenue + appStats.revenue);
    const platformFee = roundCurrency(orderStats.fee + appStats.fee);

    // Dynamic Revenue Trend Data (Scale based on range)
    const dailyRevenue = [];
    let iterations = 7;
    let unit = "days";

    if (range === "today") {
      iterations = 24;
      unit = "hours";
    } else if (range === "month") {
      iterations = 30;
      unit = "days";
    } else if (range === "lifetime") {
      iterations = 12;
      unit = "months";
    }

    for (let i = iterations - 1; i >= 0; i--) {
      const date = new Date();
      let nextDate;
      let label = "";

      if (unit === "hours") {
        date.setHours(date.getHours() - i, 0, 0, 0);
        nextDate = new Date(date);
        nextDate.setHours(date.getHours() + 1);
        label = date.toLocaleTimeString("en-US", {
          hour: "numeric",
          hour12: true,
        });
      } else if (unit === "months") {
        date.setDate(1);
        date.setMonth(date.getMonth() - i);
        date.setHours(0, 0, 0, 0);
        nextDate = new Date(date);
        nextDate.setMonth(date.getMonth() + 1);
        label = date.toLocaleDateString("en-US", { month: "short" });
      } else {
        // days (week or month)
        date.setDate(date.getDate() - i);
        date.setHours(0, 0, 0, 0);
        nextDate = new Date(date);
        nextDate.setDate(date.getDate() + 1);
        label =
          iterations > 7
            ? date.toLocaleDateString("en-US", {
                day: "numeric",
                month: "short",
              })
            : date.toLocaleDateString("en-US", { weekday: "short" });
      }

      const dayOrders = await Order.find({
        status: { $in: ["confirmed", "shipped", "delivered"] },
        updatedAt: { $gte: date, $lt: nextDate },
      });
      const dayOrderRevenue = dayOrders.reduce(
        (sum, o) => sum + (o.totalAmount || 0),
        0,
      );

      const dayApps = await Appointment.find({
        status: { $in: ["confirmed", "completed"] },
        updatedAt: { $gte: date, $lt: nextDate },
      });
      const dayAppRevenue = dayApps.reduce(
        (sum, app) => sum + (app.totalAmount || 0),
        0,
      );

      dailyRevenue.push({
        day: label,
        revenue: roundCurrency(dayOrderRevenue + dayAppRevenue),
        orders: roundCurrency(dayOrderRevenue),
        services: roundCurrency(dayAppRevenue),
      });
    }

    // Pending Applications (KYC)
    const pendingApplications = await User.find({ kycStatus: "pending" })
      .select("name email role createdAt roleData kycStatus")
      .sort({ createdAt: -1 })
      .limit(6);

    const recentAppointments = await Appointment.find()
      .populate("user", "name email")
      .sort({ createdAt: -1 })
      .limit(5);

    const recentOrders = await Order.find()
      .populate("user", "name email")
      .sort({ createdAt: -1 })
      .limit(5);

    res.json({
      stats: {
        totalUsers,
        activeTenants,
        activeDoctors,
        totalPets,
        totalProducts,
        totalOrders,
        totalRevenue,
        platformFee,
        dailyRevenue,
        range,
      },
      pendingApplications,
      recentAppointments,
      recentOrders,
    });
  } catch (error) {
    console.error(
      "Error in server/controllers/admin/get.js (getDashboardStats):",
      error,
    );
    res.status(500).json({ message: error.message });
  }
};

const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password").sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    console.error(
      "Error in server/controllers/admin/get.js (getAllUsers):",
      error,
    );
    res.status(500).json({ message: error.message });
  }
};

const getUserDetails = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    let lifetimeEarning = 0;
    if (["shop", "ngo"].includes(user.role)) {
      const shopOrders = await Order.find({
        "items.shopId": user._id,
        status: "delivered",
      });
      lifetimeEarning = shopOrders.reduce((total, order) => {
        const shopItems = order.items.filter(
          (item) => item.shopId.toString() === user._id.toString(),
        );
        return (
          total +
          shopItems.reduce(
            (sum, item) => sum + (item.price || 0) * (item.quantity || 1),
            0,
          )
        );
      }, 0);
    } else if (user.role === "hospital") {
      // Logic from hospitalManagement.js
      const explicitDoctorIds = user.roleData?.hospitalDoctorIds || [];
      const directDoctors = await User.find({
        role: "doctor",
        "roleData.hospitalId": user._id,
      });

      const combinedDoctorIds = new Set([
        ...explicitDoctorIds.map((id) => id.toString()),
        ...directDoctors.map((d) => d._id.toString()),
      ]);

      for (const dId of combinedDoctorIds) {
        const doc = await User.findById(dId);
        const completed = await Appointment.countDocuments({
          providerId: dId,
          providerType: "doctor",
          status: "completed",
        });
        lifetimeEarning += completed * (doc?.roleData?.consultationFee || 0);
      }
    } else if (user.role === "doctor") {
      const completed = await Appointment.countDocuments({
        providerId: user._id,
        providerType: "doctor",
        status: "completed",
      });
      lifetimeEarning = completed * (user.roleData?.consultationFee || 0);
    } else if (user.role === "daycare") {
      // Logic from daycareManagement.js
      const explicitStaffIds = user.roleData?.daycareStaffIds || [];
      const directStaff = await User.find({
        role: "caretaker",
        "roleData.daycareId": user._id,
      });

      const combinedStaffIds = new Set([
        ...explicitStaffIds.map((id) => id.toString()),
        ...directStaff.map((s) => s._id.toString()),
      ]);

      for (const sId of combinedStaffIds) {
        const staff = await User.findById(sId);
        const completed = await Appointment.countDocuments({
          providerId: sId,
          providerType: "caretaker",
          status: "completed",
        });
        lifetimeEarning += completed * (staff?.roleData?.hourlyRate || 0);
      }
    } else if (user.role === "caretaker") {
      const completed = await Appointment.countDocuments({
        providerId: user._id,
        providerType: "caretaker",
        status: "completed",
      });
      lifetimeEarning = completed * (user.roleData?.hourlyRate || 0);
    }

    const platformConfig = await getPlatformFeeConfig();
    const feePercent = getPlatformFeePercent(user.role, platformConfig);
    const platformCut = roundCurrency((lifetimeEarning * feePercent) / 100);
    const netEarning = roundCurrency(lifetimeEarning - platformCut);

    res.json({
      ...user.toObject(),
      lifetimeEarning,
      platformCut,
      netEarning,
      platformFeePercent: feePercent,
    });
  } catch (error) {
    console.error(
      "Error in server/controllers/admin/get.js (getUserDetails):",
      error,
    );
    res.status(500).json({ message: error.message });
  }
};

const globalSearch = async (req, res) => {
  try {
    const { q } = req.query;
    if (!q) return res.json({ users: [], orders: [], appointments: [] });

    const cleanQuery = q.startsWith("#") ? q.slice(1) : q;
    const regex = new RegExp(cleanQuery, "i");

    // Search Users (including tenants by role/name/email)
    const users = await User.find({
      $or: [
        { name: regex },
        { email: regex },
        { phone: regex },
        { role: regex },
        { "roleData.shopName": regex },
        { "roleData.hospitalName": regex },
      ],
    })
      .select("name email role kycStatus phone")
      .limit(6);

    // Search Orders (by invoice number, customer name, or ID suffix)
    const orders = await Order.find({
      $or: [
        { invoiceNumber: regex },
        { customerName: regex },
        {
          $expr: {
            $regexMatch: {
              input: { $toString: "$_id" },
              regex: cleanQuery,
              options: "i",
            },
          },
        },
      ],
    })
      .select("invoiceNumber customerName totalAmount status createdAt")
      .limit(6);

    // Search Appointments (by user name, pet name, mobile, or ID suffix)
    const appointments = await Appointment.find({
      $or: [
        { userName: regex },
        { petName: regex },
        { parentPhone: regex },
        {
          $expr: {
            $regexMatch: {
              input: { $toString: "$_id" },
              regex: cleanQuery,
              options: "i",
            },
          },
        },
      ],
    })
      .select("userName petName date time status service")
      .limit(6);

    res.json({ users, orders, appointments });
  } catch (error) {
    console.error("Error in globalSearch:", error);
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getDashboardStats,
  getAllUsers,
  getUserDetails,
  globalSearch,
};

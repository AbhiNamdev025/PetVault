const mongoose = require("mongoose");
const Order = require("../models/Order/order");
const Appointment = require("../models/Appointment/appointment");
const Pet = require("../models/Pet/pet");
const { roundCurrency, getPeriodRange } = require("./wallet");

const PROVIDER_ROLES = [
  "shop",
  "doctor",
  "caretaker",
  "hospital",
  "daycare",
  "ngo",
];

const toObjectId = (value) => new mongoose.Types.ObjectId(value);

const buildDateRangeFilter = (field, start, end) => {
  if (!start) return {};
  return {
    [field]: {
      $gte: start,
      ...(end ? { $lte: end } : {}),
    },
  };
};

const normalizeIds = (values = []) =>
  [...new Set(values.map((item) => String(item || "").trim()).filter(Boolean))];

const resolveProviderScope = (user) => {
  const role = user?.role;
  if (!PROVIDER_ROLES.includes(role)) {
    return {
      role,
      providerIds: [],
    };
  }

  let providerIds = [String(user._id)];

  if (role === "hospital") {
    const doctors = Array.isArray(user?.roleData?.hospitalDoctorIds)
      ? user.roleData.hospitalDoctorIds
      : [];
    providerIds = normalizeIds([...providerIds, ...doctors]);
  } else if (role === "daycare") {
    const caretakers = Array.isArray(user?.roleData?.daycareStaffIds)
      ? user.roleData.daycareStaffIds
      : [];
    providerIds = normalizeIds([...providerIds, ...caretakers]);
  } else {
    providerIds = normalizeIds(providerIds);
  }

  return {
    role,
    providerIds,
  };
};

const getProviderEarningsSummary = async ({ user, period = "all" }) => {
  const role = user?.role;
  if (!PROVIDER_ROLES.includes(role)) {
    return {
      providerRole: role,
      providerScopeCount: 0,
      period: "all",
      from: null,
      to: new Date(),
      summary: {
        totalEarnings: 0,
        orderEarnings: 0,
        petSalesEarnings: 0,
        appointmentsEarnings: 0,
        onlineEarnings: 0,
        offlineEarnings: 0,
        onlineOrderEarnings: 0,
        offlineOrderEarnings: 0,
        onlinePetSalesEarnings: 0,
        offlinePetSalesEarnings: 0,
        onlineAppointmentsEarnings: 0,
        offlineAppointmentsEarnings: 0,
        onlineTransactionsCount: 0,
        offlineTransactionsCount: 0,
        totalTransactionsCount: 0,
        totalOrders: 0,
        totalPetSales: 0,
        totalAppointments: 0,
      },
    };
  }

  const { providerIds } = resolveProviderScope(user);
  const validProviderObjectIds = providerIds
    .filter((id) => mongoose.isValidObjectId(id))
    .map((id) => toObjectId(id));
  const selfObjectId = toObjectId(user._id);

  const { start, end, period: normalizedPeriod } = getPeriodRange(period);
  const dateFilter = buildDateRangeFilter("updatedAt", start, end);
  const petSaleDateFilter = buildDateRangeFilter("soldAt", start, end);
  const orderItemAmountExpr = {
    $multiply: [{ $ifNull: ["$items.price", 0] }, { $ifNull: ["$items.quantity", 1] }],
  };
  const isOfflineOrderExpr = { $eq: ["$paymentMethod", "COD"] };
  const appointmentEarningExpr = {
    $max: [
      0,
      {
        $subtract: [
          { $ifNull: ["$originalAmount", "$totalAmount"] },
          { $ifNull: ["$platformFee", 0] },
        ],
      },
    ],
  };
  const isOfflineAppointmentExpr = {
    $ne: [{ $ifNull: ["$paymentMethod", "Cash"] }, "Online"],
  };

  const [orderRows, appointmentRows, petSaleRows] = await Promise.all([
    role === "shop"
      ? Order.aggregate([
          { $unwind: "$items" },
          {
            $match: {
              status: "delivered",
              "items.shopId": selfObjectId,
              ...dateFilter,
            },
          },
          {
            $group: {
              _id: null,
              orderIds: { $addToSet: "$_id" },
              orderEarnings: { $sum: orderItemAmountExpr },
              onlineOrderEarnings: {
                $sum: {
                  $cond: [isOfflineOrderExpr, 0, orderItemAmountExpr],
                },
              },
              offlineOrderEarnings: {
                $sum: {
                  $cond: [isOfflineOrderExpr, orderItemAmountExpr, 0],
                },
              },
              onlineOrderCount: {
                $sum: {
                  $cond: [isOfflineOrderExpr, 0, 1],
                },
              },
              offlineOrderCount: {
                $sum: {
                  $cond: [isOfflineOrderExpr, 1, 0],
                },
              },
            },
          },
        ])
      : Promise.resolve([]),
    Appointment.aggregate([
      {
        $match: {
          providerId: { $in: validProviderObjectIds },
          status: "completed",
          ...dateFilter,
        },
      },
      {
        $group: {
          _id: null,
          appointmentsCount: { $sum: 1 },
          appointmentEarnings: {
            $sum: appointmentEarningExpr,
          },
          onlineAppointmentsEarnings: {
            $sum: {
              $cond: [isOfflineAppointmentExpr, 0, appointmentEarningExpr],
            },
          },
          offlineAppointmentsEarnings: {
            $sum: {
              $cond: [isOfflineAppointmentExpr, appointmentEarningExpr, 0],
            },
          },
          onlineAppointmentsCount: {
            $sum: {
              $cond: [isOfflineAppointmentExpr, 0, 1],
            },
          },
          offlineAppointmentsCount: {
            $sum: {
              $cond: [isOfflineAppointmentExpr, 1, 0],
            },
          },
        },
      },
    ]),
    role === "shop"
      ? Pet.aggregate([
          {
            $match: {
              shopId: selfObjectId,
              isArchived: { $ne: true },
              soldToUserId: { $exists: true, $ne: null },
              soldAt: { $exists: true, $ne: null },
              ...petSaleDateFilter,
            },
          },
          {
            $group: {
              _id: null,
              petSalesCount: { $sum: 1 },
              petSalesEarnings: {
                $sum: {
                  $cond: [
                    { $gt: [{ $ifNull: ["$price", 0] }, 0] },
                    { $ifNull: ["$price", 0] },
                    0,
                  ],
                },
              },
            },
          },
        ])
      : Promise.resolve([]),
  ]);

  const orderSummary = orderRows[0] || {
    orderIds: [],
    orderEarnings: 0,
    onlineOrderEarnings: 0,
    offlineOrderEarnings: 0,
    onlineOrderCount: 0,
    offlineOrderCount: 0,
  };
  const appointmentSummary = appointmentRows[0] || {
    appointmentsCount: 0,
    appointmentEarnings: 0,
    onlineAppointmentsEarnings: 0,
    offlineAppointmentsEarnings: 0,
    onlineAppointmentsCount: 0,
    offlineAppointmentsCount: 0,
  };
  const petSaleSummary = petSaleRows[0] || {
    petSalesCount: 0,
    petSalesEarnings: 0,
  };

  const orderEarnings = roundCurrency(orderSummary.orderEarnings || 0);
  const onlineOrderEarnings = roundCurrency(orderSummary.onlineOrderEarnings || 0);
  const offlineOrderEarnings = roundCurrency(orderSummary.offlineOrderEarnings || 0);
  const petSalesEarnings = roundCurrency(petSaleSummary.petSalesEarnings || 0);
  const onlinePetSalesEarnings = 0;
  const offlinePetSalesEarnings = petSalesEarnings;
  const appointmentsEarnings = roundCurrency(
    appointmentSummary.appointmentEarnings || 0,
  );
  const onlineAppointmentsEarnings = roundCurrency(
    appointmentSummary.onlineAppointmentsEarnings || 0,
  );
  const offlineAppointmentsEarnings = roundCurrency(
    appointmentSummary.offlineAppointmentsEarnings || 0,
  );
  const onlineEarnings = roundCurrency(
    onlineOrderEarnings + onlinePetSalesEarnings + onlineAppointmentsEarnings,
  );
  const offlineEarnings = roundCurrency(
    offlineOrderEarnings + offlinePetSalesEarnings + offlineAppointmentsEarnings,
  );
  const totalEarnings = roundCurrency(
    orderEarnings + petSalesEarnings + appointmentsEarnings,
  );
  const onlineTransactionsCount =
    Number(orderSummary.onlineOrderCount || 0) +
    Number(appointmentSummary.onlineAppointmentsCount || 0);
  const offlineTransactionsCount =
    Number(orderSummary.offlineOrderCount || 0) +
    Number(petSaleSummary.petSalesCount || 0) +
    Number(appointmentSummary.offlineAppointmentsCount || 0);

  return {
    providerRole: role,
    providerScopeCount: providerIds.length,
    period: normalizedPeriod,
    from: start,
    to: end,
    summary: {
      totalEarnings,
      orderEarnings,
      petSalesEarnings,
      appointmentsEarnings,
      onlineEarnings,
      offlineEarnings,
      onlineOrderEarnings,
      offlineOrderEarnings,
      onlinePetSalesEarnings,
      offlinePetSalesEarnings,
      onlineAppointmentsEarnings,
      offlineAppointmentsEarnings,
      onlineTransactionsCount,
      offlineTransactionsCount,
      totalTransactionsCount:
        Number(onlineTransactionsCount || 0) +
        Number(offlineTransactionsCount || 0),
      totalOrders: Array.isArray(orderSummary.orderIds)
        ? orderSummary.orderIds.length
        : 0,
      totalPetSales: Number(petSaleSummary.petSalesCount || 0),
      totalAppointments: Number(appointmentSummary.appointmentsCount || 0),
    },
  };
};

module.exports = {
  PROVIDER_ROLES,
  resolveProviderScope,
  getProviderEarningsSummary,
};

const PlatformFeeConfig = require("../models/PlatformFee/platformFee");

const roundCurrency = (value) => Math.round((value + Number.EPSILON) * 100) / 100;

const normalizeRole = (role) => (role ? role.toLowerCase() : "default");

const getPlatformFeeConfig = async () => {
  let config = await PlatformFeeConfig.findOne();
  if (!config) {
    config = await PlatformFeeConfig.create({});
  }
  return config;
};

const getPlatformFeePercent = (role, config) => {
  if (!config) return 2;
  const normalizedRole = normalizeRole(role);
  if (config.roleOverrides) {
    if (typeof config.roleOverrides.get === "function") {
      const rolePercent = config.roleOverrides.get(normalizedRole);
      if (typeof rolePercent === "number") return rolePercent;
    } else if (Object.prototype.hasOwnProperty.call(config.roleOverrides, normalizedRole)) {
      const rolePercent = config.roleOverrides[normalizedRole];
      if (typeof rolePercent === "number") return rolePercent;
    }
  }
  return typeof config.defaultPercent === "number" ? config.defaultPercent : 2;
};

const calculatePlatformFee = (amount, percent) =>
  roundCurrency((amount || 0) * ((percent || 0) / 100));

module.exports = {
  getPlatformFeeConfig,
  getPlatformFeePercent,
  calculatePlatformFee,
  roundCurrency,
};

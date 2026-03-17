const PlatformFeeConfig = require("../models/PlatformFee/platformFee");

const sanitizePercent = (value) => {
  const num = Number(value);
  if (Number.isNaN(num)) return null;
  if (num < 0 || num > 100) return null;
  return Math.round((num + Number.EPSILON) * 100) / 100;
};

const getPlatformFeeConfig = async (req, res) => {
  try {
    let config = await PlatformFeeConfig.findOne();
    if (!config) config = await PlatformFeeConfig.create({});
    res.json({
      defaultPercent: config.defaultPercent,
      roleOverrides: Object.fromEntries(config.roleOverrides || []),
    });
  } catch (error) {
    console.error("Error in getPlatformFeeConfig:", error);
    res.status(500).json({ message: error.message });
  }
};

const updatePlatformFeeConfig = async (req, res) => {
  try {
    const { defaultPercent, roleOverrides } = req.body || {};

    let config = await PlatformFeeConfig.findOne();
    if (!config) config = await PlatformFeeConfig.create({});

    if (defaultPercent !== undefined) {
      const normalized = sanitizePercent(defaultPercent);
      if (normalized === null) {
        return res.status(400).json({ message: "Invalid defaultPercent" });
      }
      config.defaultPercent = normalized;
    }

    if (roleOverrides && typeof roleOverrides === "object") {
      const sanitizedOverrides = {};
      Object.entries(roleOverrides).forEach(([role, value]) => {
        const normalizedRole = String(role).toLowerCase();
        const normalized = sanitizePercent(value);
        if (normalized !== null) sanitizedOverrides[normalizedRole] = normalized;
      });
      config.roleOverrides = sanitizedOverrides;
    }

    await config.save();

    res.json({
      defaultPercent: config.defaultPercent,
      roleOverrides: Object.fromEntries(config.roleOverrides || []),
    });
  } catch (error) {
    console.error("Error in updatePlatformFeeConfig:", error);
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getPlatformFeeConfig,
  updatePlatformFeeConfig,
};

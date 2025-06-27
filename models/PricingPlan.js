const { DataTypes } = require('sequelize');
const sequelize = require('../config/db'); // ✅ Make sure this exports the configured instance

const PricingPlan = sequelize.define('PricingPlan', {
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  price: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  is_best_value: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
});

module.exports = PricingPlan;

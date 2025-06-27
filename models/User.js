const sequelize = require('../config/sequelize');
const { DataTypes } = require('sequelize');

const User = sequelize.define('User', {
  // your columns
  name: DataTypes.STRING,
  email: DataTypes.STRING,
}, {});

module.exports = User;

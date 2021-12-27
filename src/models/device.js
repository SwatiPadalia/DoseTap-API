'use strict';
module.exports = (sequelize, DataTypes) => {
  const Device = sequelize.define('Device', {
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    description: DataTypes.STRING,
    serialNumber: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    status: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    isSold: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    }
  }, {});
  Device.associate = function (models) {
    // associations can be defined here
  };
  return Device;
};
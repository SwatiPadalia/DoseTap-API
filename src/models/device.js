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
    firmwareVersion: {
      type: DataTypes.STRING,
    },
    isSold: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    }
  }, {});
  Device.associate = function (models) {
    Device.hasOne(models.DeviceCompanyMappings, {
      foreignKey: 'device_id',
      as: 'device_mapping'
    });
  };
  return Device;
};
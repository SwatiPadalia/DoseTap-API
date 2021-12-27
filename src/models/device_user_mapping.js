'use strict';
module.exports = (sequelize, DataTypes) => {
  const DeviceUserMapping = sequelize.define('DeviceUserMapping', {
    lastSync: DataTypes.DATE
  }, {});
  DeviceUserMapping.associate = function (models) {
    // associations can be defined here
  };
  return DeviceUserMapping;
};
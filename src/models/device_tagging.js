'use strict';
module.exports = (sequelize, DataTypes) => {
  const DeviceTagging = sequelize.define('DeviceTagging', {
    device_id: {
      type: DataTypes.INTEGER,
      references: {
        model: 'Device',
        key: 'id'
      },
      allowNull: false,
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE'
    },
    company_id: {
      type: DataTypes.INTEGER,
      references: {
        model: 'Company',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE'
    },
    doctor_id: {
      type: DataTypes.INTEGER,
      references: {
        model: 'User',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE'
    },
  }, {});
  DeviceTagging.associate = function (models) {
    // associations can be defined here
  };
  return DeviceTagging;
};
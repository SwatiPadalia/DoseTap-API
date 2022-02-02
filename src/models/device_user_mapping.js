'use strict';
module.exports = (sequelize, DataTypes) => {
  const DeviceUserMapping = sequelize.define('DeviceUserMapping', {
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
    patient_id: {
      type: DataTypes.INTEGER,
      references: {
        model: 'User',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE'
    },
    lastSync: DataTypes.DATE
  }, {});
  DeviceUserMapping.associate = function (models) {
    // associations can be defined here
  };
  return DeviceUserMapping;
};
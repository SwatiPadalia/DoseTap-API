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
    DeviceUserMapping.belongsTo(models.Device,
      {
        foreignKey: 'device_id',
        as: 'device',
      }
    );
    DeviceUserMapping.belongsTo(models.User,
      {
        foreignKey: 'patient_id',
        as: 'patient',
      }
    );
    DeviceUserMapping.belongsTo(models.Company,
      {
        foreignKey: 'company_id',
        as: 'company',
      }
    );
    DeviceUserMapping.belongsTo(models.User,
      {
        foreignKey: 'doctor_id',
        as: 'doctor',
      }
    );
  };
  return DeviceUserMapping;
};
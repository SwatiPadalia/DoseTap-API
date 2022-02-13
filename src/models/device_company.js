'use strict';
module.exports = (sequelize, DataTypes) => {
  const DeviceCompanyMappings = sequelize.define('DeviceCompanyMappings', {
    device_id: {
      type: DataTypes.INTEGER,
      references: {
        model: 'Devices',
        key: 'id'
      },
      allowNull: false,
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE'
    },
    company_id: {
      type: DataTypes.INTEGER,
      references: {
        model: 'Companies',
        key: 'id'
      },
      allowNull: false,
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE'
    }
  }, {});
  DeviceCompanyMappings.associate = function (models) {
    DeviceCompanyMappings.belongsTo(models.Device,
      {
        foreignKey: 'device_id',
        as: 'device',
      }
    );
    DeviceCompanyMappings.belongsTo(models.Company,
      {
        foreignKey: 'company_id',
        as: 'company',
      }
    );
  };
  return DeviceCompanyMappings;
};
'use strict';
module.exports = (sequelize, DataTypes) => {
  const ScheduleDose = sequelize.define('ScheduleDose', {
    patient_id: {
      type: DataTypes.INTEGER,
      references: {
        model: 'Device',
        key: 'id'
      },
      allowNull: false,
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE'
    },
    medicine_id: {
      type: DataTypes.INTEGER,
      references: {
        model: 'Device',
        key: 'id'
      },
      allowNull: false,
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE'
    },
    count_morning: {
      type: DataTypes.JSON
    },
    count_afternoon: {
      type: DataTypes.JSON
    },
    count_evening: {
      type: DataTypes.JSON
    },
    count_night: {
      type: DataTypes.JSON
    },
    slot_ids: {
      type: DataTypes.JSON,
      allowNull: false,
    },
    days: {
      type: DataTypes.JSON,
      allowNull: false
    }
  }, {});
  ScheduleDose.associate = function (models) {
    ScheduleDose.belongsTo(models.User, {
      foreignKey: 'patient_id',
      as: 'patientDetails'
    });
    ScheduleDose.belongsTo(models.Medicine, {
      foreignKey: 'medicine_id',
      as: 'medicineDetails'
    });
  };
  return ScheduleDose;
};
'use strict';
module.exports = (sequelize, DataTypes) => {
  const CareTakerScheduleDose = sequelize.define('CareTakerScheduleDose', {
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
  CareTakerScheduleDose.associate = function (models) {
    CareTakerScheduleDose.belongsTo(models.User, {
      foreignKey: 'patient_id',
      as: 'patientDetails'
    });
    CareTakerScheduleDose.belongsTo(models.Medicine, {
      foreignKey: 'medicine_id',
      as: 'medicineDetails'
    });
  };
  return CareTakerScheduleDose;
};
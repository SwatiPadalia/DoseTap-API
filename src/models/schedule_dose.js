'use strict';
module.exports = (sequelize, DataTypes) => {
  const ScheduleDose = sequelize.define('ScheduleDose', {
    count: DataTypes.INTEGER,
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
    slot_id: {
      type: DataTypes.INTEGER,
      references: {
        model: 'Device',
        key: 'id'
      },
      allowNull: false,
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE'
    },
    time: {
      type: DataTypes.STRING,
      allowNull: false
    },
    days: {
      type: DataTypes.JSON,
      allowNull: false
    }
  }, {});
  ScheduleDose.associate = function (models) {
    // // associations can be defined here
    // ScheduleDose.belongsTo(models.User, {
    //   foreignKey: 'patient_id',
    //   as: 'patientDetails'
    // });
    // ScheduleDose.belongsTo(models.Medicine, {
    //   foreignKey: 'medicine_id',
    //   as: 'medicineDetails'
    // });
    // ScheduleDose.belongsTo(models.Slot, {
    //   foreignKey: 'slot_id',
    //   as: 'slotDetails'
    // });
  };
  return ScheduleDose;
};
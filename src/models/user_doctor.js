'use strict';
module.exports = (sequelize, DataTypes) => {
  const UserDoctorMappings = sequelize.define('UserDoctorMappings', {
    patient_id: {
      type: DataTypes.INTEGER,
      references: {
        model: 'User',
        key: 'id'
      },
      allowNull: false,
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE'
    },
    doctor_id: {
      type: DataTypes.INTEGER,
      references: {
        model: 'User',
        key: 'id'
      },
      allowNull: false,
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE'
    }
  }, {});
  UserDoctorMappings.associate = function (models) {
    UserDoctorMappings.belongsTo(models.User,
      {
        foreignKey: 'patient_id',
        as: 'patient',
      }
    );
    UserDoctorMappings.belongsTo(models.User,
      {
        foreignKey: 'doctor_id',
        as: 'doctor',
      }
    );
  };
  return UserDoctorMappings;
};
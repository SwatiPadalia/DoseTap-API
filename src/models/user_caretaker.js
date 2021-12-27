'use strict';
module.exports = (sequelize, DataTypes) => {
  const UserCareTaker = sequelize.define('UserCareTaker', {
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
    caretaker_id: {
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
  UserCareTaker.associate = function (models) {
    // associations can be defined here
  };
  return UserCareTaker;
};
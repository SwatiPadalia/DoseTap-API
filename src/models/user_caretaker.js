'use strict';
module.exports = (sequelize, DataTypes) => {
  const UserCareTakerMappings = sequelize.define('UserCareTakerMappings', {
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
  UserCareTakerMappings.associate = function (models) {
    // associations can be defined here
  };
  return UserCareTakerMappings;
};
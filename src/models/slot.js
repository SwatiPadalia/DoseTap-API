'use strict';
module.exports = (sequelize, DataTypes) => {
  const Slot = sequelize.define('Slot', {
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    type: {
      type: DataTypes.ENUM,
      allowNull: false,
      values: ['before', 'after']
    },
    startTime: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    endTime: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    order: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    displayName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    displayType: {
      type: DataTypes.STRING,
      allowNull: false,
    }
  }, {});
  Slot.associate = function (models) {
    // associations can be defined here
  };
  return Slot;
};
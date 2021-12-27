'use strict';
module.exports = (sequelize, DataTypes) => {
  const Medicine = sequelize.define('Medicine', {
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    status: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
    companyName: {
      type: DataTypes.STRING,
      allowNull: false
    }
  }, {});
  Medicine.associate = function (models) {
    // associations can be defined here
  };
  return Medicine;
};
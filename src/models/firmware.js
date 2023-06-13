'use strict';
module.exports = (sequelize, DataTypes) => {
  const Firmwares = sequelize.define('Firmwares', {
    version: DataTypes.STRING,
    fileUrl: DataTypes.STRING,
    status: { type: DataTypes.BOOLEAN, defaultValue: false, },
    remark: DataTypes.STRING,
  }, {});
  Firmwares.associate = function (models) {
    // associations can be defined here
  };
  return Firmwares;
};
'use strict';
module.exports = (sequelize, DataTypes) => {
  const ScheduleDose = sequelize.define('ScheduleDose', {
    count: DataTypes.INTEGER
  }, {});
  ScheduleDose.associate = function(models) {
    // associations can be defined here
  };
  return ScheduleDose;
};
'use strict';
module.exports = (sequelize, DataTypes) => {
  const ReferenceCodes = sequelize.define('ReferenceCodes', {
    code: DataTypes.STRING,
    description: DataTypes.STRING,
    status: { type: DataTypes.BOOLEAN, defaultValue: true, }
  }, {});
  ReferenceCodes.associate = function (models) {
    // associations can be defined here
  };
  return ReferenceCodes;
};
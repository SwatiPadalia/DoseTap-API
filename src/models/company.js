'use strict';
module.exports = (sequelize, DataTypes) => {
  const Company = sequelize.define('Company', {
    firstName: {
      type: DataTypes.STRING
    },
    lastName: {
      type: DataTypes.STRING
    },
    email: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    phone: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    verifyToken: {
      type: DataTypes.STRING,
      defaultValue: null,
    },
    isVerified: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    status: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
  }, {
    defaultScope: {
      attributes: { exclude: ['password', 'verifyToken'] },
    },
    scopes: {
      withSecretColumns: {
        attributes: { include: ['password', 'verifyToken'] },
      },
    },
  }, {});
  Company.associate = function (models) {
    // associations can be defined here
  };
  return Company;
};
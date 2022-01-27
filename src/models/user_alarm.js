'use strict';
module.exports = (sequelize, DataTypes) => {
  const UserAlarm = sequelize.define('UserAlarm', {
    value: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    user_id: {
      type: DataTypes.INTEGER,
      references: {
        model: 'User',
        key: 'id'
      },
      allowNull: false,
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE'
    },
    recordDate: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
  }, {
    tableName: 'UserAlarm'
  });
  UserAlarm.associate = function (models) {
    // associations can be defined here
  };
  return UserAlarm;
};
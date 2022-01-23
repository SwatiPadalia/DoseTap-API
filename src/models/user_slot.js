'use strict';
module.exports = (sequelize, DataTypes) => {
  const UserSlot = sequelize.define('UserSlot', {
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
    slot_id: {
      type: DataTypes.INTEGER,
      references: {
        model: 'Slot',
        key: 'id'
      },
      allowNull: false,
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE'
    },
    time: {
      type: DataTypes.STRING,
    }
  }, {
    tableName: 'UserSlot'
  });
  UserSlot.associate = function (models) {
    UserSlot.belongsTo(models.Slot,
      {
        foreignKey: 'slot_id',
        as: 'slots',
      }
    );
  };
  return UserSlot;
};
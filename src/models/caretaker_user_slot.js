'use strict';
module.exports = (sequelize, DataTypes) => {
  const CareTakerUserSlot = sequelize.define('CareTakerUserSlot', {
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
    tableName: 'CareTakerUserSlot'
  });
  CareTakerUserSlot.associate = function (models) {
    CareTakerUserSlot.belongsTo(models.Slot,
      {
        foreignKey: 'slot_id',
        as: 'slots',
      }
    );
  };
  return CareTakerUserSlot;
};
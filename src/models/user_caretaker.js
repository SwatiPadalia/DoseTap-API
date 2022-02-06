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
    UserCareTakerMappings.belongsTo(models.User,
      {
        foreignKey: 'patient_id',
        as: 'patient',
      }
    );
    UserCareTakerMappings.belongsTo(models.User,
      {
        foreignKey: 'caretaker_id',
        as: 'caretaker',
      }
    );
  };
  return UserCareTakerMappings;
};
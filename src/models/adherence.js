'use strict';
'use strict';
module.exports = (sequelize, DataTypes) => {
  const Adherence = sequelize.define('Adherence', {
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
    status: {
      type: DataTypes.ENUM,
      allowNull: false,
      values: ['open', 'missed']
    },
    date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    time: {
      type: DataTypes.TIME,
      allowNull: false,
    },
  }, {
    tableName: 'Adherence'
  });
  Adherence.associate = function (models) {
    // associations can be defined here
  };
  return Adherence;
};
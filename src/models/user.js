

module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define(
    'User',
    {
      firstName: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      lastName: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      age: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      gender: {
        type: DataTypes.ENUM,
        allowNull: false,
        values: ['male', 'female', 'other']
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
      city: {
        type: DataTypes.STRING,
        defaultValue: null
      },
      state: {
        type: DataTypes.STRING,
        defaultValue: null
      },
      role: {
        type: DataTypes.ENUM,
        allowNull: false,
        values: ['admin', 'user', 'caretaker', 'doctor', 'company']
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
      caretaker_code: {
        type: DataTypes.STRING,
      },
      appVersion: {
        type: DataTypes.STRING,
      },
    },
    {
      defaultScope: {
        attributes: { exclude: ['password', 'verifyToken'] },
      },
      scopes: {
        withSecretColumns: {
          attributes: { include: ['password', 'verifyToken'] },
        },
      },
    },
  );
  User.associate = function (models) {
    User.belongsTo(models.Company, {
      foreignKey: 'company_id',
      as: 'company'
    });

  };
  return User;
};

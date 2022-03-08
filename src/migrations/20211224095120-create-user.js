

module.exports = {
  up: (queryInterface, Sequelize) => queryInterface.createTable('Users', {
    id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: Sequelize.INTEGER,
    },
    firstName: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    lastName: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    dob: {
      type: Sequelize.DATEONLY,
      allowNull: false,
    },
    gender: {
      type: Sequelize.ENUM,
      allowNull: false,
      values: ['male', 'female', 'other']
    },
    email: {
      type: Sequelize.STRING,
      allowNull: true,
      unique: true
    },
    password: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    phone: {
      type: Sequelize.STRING,
      allowNull: false,
      unique: true
    },
    city: {
      type: Sequelize.STRING,
      defaultValue: null
    },
    state: {
      type: Sequelize.STRING,
      defaultValue: null
    },
    role: {
      type: Sequelize.ENUM,
      allowNull: false,
      values: ['admin', 'user', 'caretaker', 'doctor', 'company']
    },
    company_id: {
      type: Sequelize.INTEGER,
      references: {
        model: 'Companies',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE'
    },
    reference_code: {
      type: Sequelize.STRING,
    },
    verifyToken: {
      type: Sequelize.STRING,
      defaultValue: null,
    },
    isVerified: {
      type: Sequelize.BOOLEAN,
      defaultValue: true,
    },
    status: {
      type: Sequelize.BOOLEAN,
      defaultValue: true,
    },
    lastSync: {
      type: Sequelize.DATE
    },
    appVersion: {
      type: Sequelize.STRING,
      defaultValue: null
    },
    createdAt: {
      allowNull: false,
      type: Sequelize.DATE,
      defaultValue: Sequelize.literal('NOW()')
    },
    updatedAt: {
      allowNull: false,
      type: Sequelize.DATE,
      defaultValue: Sequelize.literal('NOW()')
    },
  }),
  down: (queryInterface, Sequelize) => queryInterface.dropTable('Users'),
};

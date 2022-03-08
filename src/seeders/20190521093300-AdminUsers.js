

module.exports = {
  up: (queryInterface, Sequelize) => queryInterface.bulkInsert(
    'Users',
    [
      {
        firstName: 'Admin',
        lastName: 'User',
        email: 'admin@gmail.com',
        password: '25d55ad283aa400af464c76d713c07ad',
        role: "admin",
        city: "Delhi",
        gender: "male",
        dob: '2022-01-17',
        state: "West Bengal",
        phone: '8722682249',
        createdAt: new Date(),
        updatedAt: new Date(),
      }
    ],
    {},
  ),

  down: (queryInterface, Sequelize) => queryInterface.bulkDelete('Users', null, {}),
};

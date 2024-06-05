'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => queryInterface.bulkInsert(
    'Users',
    [
      {
        firstName: 'Normal',
        lastName: 'User',
        email: 'patient@gmail.com',
        password: '25d55ad283aa400af464c76d713c07ad',
        role: "user",
        city: "Delhi",
        gender: "male",
        dob: '2022-01-17',
        reference_code: "USER123",
        state: "West Bengal",
        phone: '8722682248',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        firstName: 'Caretaker',
        lastName: 'User',
        email: 'caretaker@gmail.com',
        password: '25d55ad283aa400af464c76d713c07ad',
        role: "caretaker",
        city: "Delhi",
        gender: "male",
        dob: '2022-01-17',
        state: "West Bengal",
        phone: '8722682246',
        createdAt: new Date(),
        updatedAt: new Date(),
      }
    ],
    {},
  ),

  down: (queryInterface, Sequelize) => queryInterface.bulkDelete('Users', null, {}),
};
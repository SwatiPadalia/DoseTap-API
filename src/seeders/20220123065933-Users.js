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
        age: 23,
        caretaker_code: "USER123",
        state: "West Bengal",
        phone: '8722682248',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        firstName: 'Doctor',
        lastName: 'User',
        email: 'doctor@gmail.com',
        password: '25d55ad283aa400af464c76d713c07ad',
        role: "doctor",
        city: "Delhi",
        gender: "male",
        age: 23,
        caretaker_code: "DOC123",
        state: "West Bengal",
        phone: '8722682247',
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
        age: 23,
        caretaker_code: "USER123",
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
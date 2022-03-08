'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => queryInterface.bulkInsert(
    'Users',
    [
      {
        firstName: 'Company',
        lastName: 'User',
        email: 'company@gmail.com',
        password: '25d55ad283aa400af464c76d713c07ad',
        role: "company",
        city: "Bangalore",
        gender: "male",
        dob: '2022-01-17',
        reference_code: null,
        company_id: 1,
        state: "Karnataka",
        phone: '8722682233',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        firstName: 'Company 2',
        lastName: 'User',
        email: 'company2@gmail.com',
        password: '25d55ad283aa400af464c76d713c07ad',
        role: "company",
        city: "Hyderabad",
        gender: "male",
        dob: '2022-01-17',
        reference_code: null,
        company_id: 2,
        state: "Telegana",
        phone: '8722682212',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ],
    {},
  ),

  down: (queryInterface, Sequelize) => queryInterface.bulkDelete('Users', null, {}),
};
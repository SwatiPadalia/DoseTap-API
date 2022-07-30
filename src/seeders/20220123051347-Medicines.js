"use strict";

module.exports = {
  up: (queryInterface, Sequelize) =>
    queryInterface.bulkInsert(
      "Medicines",
      [
        {
          name: "D-Cold Total",
          companyName: "Randall",
        },
        {
          name: "Anacin",
          companyName: "Randall",
        },
        {
          name: "Norvasc",
          companyName: "Randall",
        },
        {
          name: "Metformin",
          companyName: "Randall",
        },
        {
          name: "Bunavail",
          companyName: "Randall",
        },
        {
          name: "Telma 40mg",
          companyName: "Randall",
        },
        {
          name: "Aminophylline 225mg",
          companyName: "Randall",
        },
        {
          name: "Aspirin",
          companyName: "Randall",
        },
      ],
      {}
    ),

  down: (queryInterface, Sequelize) =>
    queryInterface.bulkDelete("Medicines", null, {}),
};

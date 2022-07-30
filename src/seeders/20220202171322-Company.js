"use strict";

module.exports = {
  up: (queryInterface, Sequelize) =>
    queryInterface.bulkInsert(
      "Companies",
      [
        {
          name: "Company1",
          status: 1,
        },
        {
          name: "Company2",
          status: 1,
        },
      ],
      {}
    ),

  down: (queryInterface, Sequelize) =>
    queryInterface.bulkDelete("Companies", null, {}),
};

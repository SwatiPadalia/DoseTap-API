"use strict";

module.exports = {
  up: (queryInterface, Sequelize) =>
    queryInterface.bulkInsert(
      "DeviceCompanyMappings",
      [
        {
          device_id: 1,
          company_id: 1,
        },
        {
          device_id: 2,
          company_id: 1,
        },
      ],
      {}
    ),

  down: (queryInterface, Sequelize) =>
    queryInterface.bulkDelete("DeviceCompanyMappings", null, {}),
};

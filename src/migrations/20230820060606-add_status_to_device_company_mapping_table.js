"use strict";

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.addColumn("DeviceCompanyMappings", "status", {
      type: Sequelize.BOOLEAN,
      defaultValue: true,
    });
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.removeColumn("DeviceCompanyMappings", "status");
  },
};

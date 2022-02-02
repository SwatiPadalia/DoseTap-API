'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => queryInterface.bulkInsert(
    'Devices',
    [
      {
        "name": "device1",
        "description": "device1",
        "serialNumber": "device1",
        "status": 1,
        "isSold": 1,
      },
      {
        "name": "device2",
        "description": "device2",
        "serialNumber": "device2",
        "status": 1,
        "isSold": 1,
      }
    ],
    {},
  ),

  down: (queryInterface, Sequelize) => queryInterface.bulkDelete('Devices', null, {}),
};

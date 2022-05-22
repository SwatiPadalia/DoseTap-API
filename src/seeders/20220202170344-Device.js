'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => queryInterface.bulkInsert(
    'Devices',
    [
      {
        "name": "device1",
        "description": "Swati",
        "serialNumber": "A01582",
        "status": 1,
        "isSold": 0,
      },
      {
        "name": "device2",
        "description": "Sakil",
        "serialNumber": "A15990",
        "status": 1,
        "isSold": 0,
      }
    ],
    {},
  ),

  down: (queryInterface, Sequelize) => queryInterface.bulkDelete('Devices', null, {}),
};

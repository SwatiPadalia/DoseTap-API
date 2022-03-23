'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => queryInterface.bulkInsert(
    'DeviceUserMappings',
    [
      {
        "device_id": 1,
        "patient_id": 2,
        "company_id": 1,
        "doctor_id": 3
      }
    ],
    {},
  ),

  down: (queryInterface, Sequelize) => queryInterface.bulkDelete('DeviceUserMappings', null, {}),
};

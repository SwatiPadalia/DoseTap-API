

module.exports = {
  up: (queryInterface, Sequelize) => queryInterface.bulkInsert(
    'UserCareTakerMappings',
    [
      {
        "patient_id": 2,
        "caretaker_id": 4
      }
    ],
    {},
  ),

  down: (queryInterface, Sequelize) => queryInterface.bulkDelete('UserCareTakerMappings', null, {}),
};

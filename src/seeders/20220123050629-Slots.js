'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => queryInterface.bulkInsert(
    'Slots',
    [
      {
        "name": "Morning",
        "type": "before",
        "startTime": "5 AM",
        "endTime": "9 AM",
        "order": 1,
        "displayName": "Morning",
        "displayType": "before meals"
      }, {
        "name": "Morning",
        "type": "after",
        "startTime": "9 AM",
        "endTime": "12 PM",
        "order": 2,
        "displayName": "Morning",
        "displayType": "after meals"
      },
      {
        "name": "Afternoon",
        "type": "before",
        "startTime": "12 PM",
        "endTime": "1 PM",
        "order": 3,
        "displayName": "Afternoon",
        "displayType": "before meals"
      },
      {
        "name": "Afternoon",
        "type": "after",
        "startTime": "1 PM",
        "endTime": "3 PM",
        "order": 4,
        "displayName": "Afternoon",
        "displayType": "after meals"
      },
      {
        "name": "Evening",
        "type": "before",
        "startTime": "3 PM",
        "endTime": "5 PM",
        "order": 5,
        "displayName": "Evening",
        "displayType": "before meals"
      }, {
        "name": "Evening",
        "type": "after",
        "startTime": "5 PM",
        "endTime": "7 PM",
        "order": 6,
        "displayName": "Evening",
        "displayType": "after meals"
      },
      {
        "name": "Night",
        "type": "before",
        "startTime": "7 PM",
        "endTime": "9 PM",
        "order": 7,
        "displayName": "Night",
        "displayType": "before meals"
      },
      {
        "name": "Night",
        "type": "after",
        "startTime": "9 PM",
        "endTime": "11 PM",
        "order": 8,
        "displayName": "Night",
        "displayType": "after meals"
      }
    ],
    {},
  ),

  down: (queryInterface, Sequelize) => queryInterface.bulkDelete('Slots', null, {}),
};

'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.addColumn('Adherence', 'slot_id', { type: Sequelize.INTEGER, allowNull: true });
  },

  down: (queryInterface, Sequelize) => {
    queryInterface.removeColumn(
      'Adherence',
      'slot_id')
  }
};

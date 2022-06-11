'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('game_histories', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      room_id: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      p1_pick: {
        type: Sequelize.STRING,
        allowNull: true
      },
      p2_pick: {
        type: Sequelize.STRING,
        allowNull: true
      },
      round: {
        type: Sequelize.INTEGER,
        allowNull: true
      },
      round_winner: {
        type: Sequelize.INTEGER,
        allowNull: true
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('game_histories');
  }
};
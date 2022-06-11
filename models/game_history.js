'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class game_history extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      game_history.belongsTo(models.game_room, {
        foreignKey: "room_id",
        onDelete: "SET NULL"
      })
    }
  }
  game_history.init({
    room_id: DataTypes.INTEGER,
    p1_pick: DataTypes.STRING,
    p2_pick: DataTypes.STRING,
    round: DataTypes.INTEGER,
    round_winner: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'game_history',
  });
  return game_history;
};
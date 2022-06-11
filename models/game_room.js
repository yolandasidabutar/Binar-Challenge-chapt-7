'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class game_room extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      game_room.belongsTo(models.game_user, {
        foreignKey: 'p1_id'
      })
      game_room.belongsTo(models.game_user, {
        foreignKey: 'p2_id'
      })
      game_room.hasMany(models.game_history, {
        foreignKey: 'room_id'
      })
    }
  }
  game_room.init({
    p1_id: DataTypes.INTEGER,
    p2_id: DataTypes.INTEGER,
    room_name: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'game_room',
  });
  return game_room;
};
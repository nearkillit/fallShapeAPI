'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class shapes extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  };
  shapes.init({
    user_id: DataTypes.INTEGER,
    put_x: DataTypes.INTEGER,
    user_name: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'shapes',
    underscored: true,
  });
  return shapes;
};
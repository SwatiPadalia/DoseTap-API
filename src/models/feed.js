'use strict';
module.exports = (sequelize, DataTypes) => {
  const Feed = sequelize.define('Feed', {
    title: DataTypes.STRING,
    description: DataTypes.STRING,
    shortDescription: DataTypes.STRING,
    status: DataTypes.BOOLEAN,
    url: DataTypes.STRING,
    type: DataTypes.STRING
  }, {});
  Feed.associate = function (models) {
    // associations can be defined here
  };
  return Feed;
};
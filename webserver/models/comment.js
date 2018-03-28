'use strict';
const loader = require('./sequelizeLoader');
const Sequelize = loader.Sequelize;

const Comment = loader.database.define(
  'comments',
  {
    commentId: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false
    },
    content: {
      type: Sequelize.STRING,
      allowNull: false
    },
    videoPosition: {
      type: Sequelize.INTEGER,
      allowNull: false
    },
    videoId: {
      type: Sequelize.STRING,
      allowNull: false
    },
    userId: {
      type: Sequelize.INTEGER,
      allowNull: false
    }
  },
  {
    freezeTableName: false,
    timestamps: true,
    indexes: [
      {
        fields: ['videoId']
      },
      {
        fields: ['userId']
      },
      {
        fields: ['videoPosition']
      },
      {
        fields: ['createdAt']
      }
    ]
  }
);

module.exports = Comment;
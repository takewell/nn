const loader = require('./sequelizeLoader');
const Sequelize = loader.Sequelize;

module.exports = loader.database.define(
  'videostatistics',
  {
    videoId: {
      type: Sequelize.STRING,
      primaryKey: true,
      allowNull: false
    },
    playCount: {
      type: Sequelize.INTEGER,
      defaultValue: 0,
      allowNull: false
    },
    commentCount: {
      type: Sequelize.INTEGER,
      defaultValue: 0,
      allowNull: false
    },
    myListCount: {
      type: Sequelize.INTEGER,
      defaultValue: 0,
      allowNull: false
    }
  },
  {
    freezeTableName: false,
    timestamps: true
  }
);
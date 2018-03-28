const loader = require('./sequelizeLoader');
const Sequelize = loader.Sequelize;

const Video = loader.database.define(
  'videos',
  {
    videoId: {
      type: Sequelize.STRING,
      primaryKey: true,
      allowNull: false
    },
    title: {
      type: Sequelize.STRING,
      allowNull: true
    },
    description: {
      type: Sequelize.TEXT,
      allowNull: true
    },
    contentType: {
      type: Sequelize.STRING,
      allowNull: true
    },
    videoStatus: {
      type: Sequelize.STRING,
      allowNull: true
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
        fields: ['videoStatus']
      },
      {
        fields: ['userId']
      },
      {
        fields: ['createdAt']
      }
    ]
  }
);

module.exports = Video;
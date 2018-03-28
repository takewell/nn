const loader = require('./sequelizeLoader');
const Sequelize = loader.Sequelize;

const Mylistitem = loader.database.define(
  'mylistitems',
  {
    mylistitemId: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true
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
        fields: ['createdAt']
      }
    ]
  }
);

module.exports = Mylistitem;
const loader = require('./sequelizeLoader');
const Sequelize = loader.Sequelize;

const User = loader.database.define(
  'users',
  {
    userId: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false
    },
    email: {
      type: Sequelize.STRING,
      unique: true,
      allowNull: false
    },
    userName: {
      type: Sequelize.STRING,
      allowNull: true
    },
    passwordDigest: {
      type: Sequelize.STRING,
      allowNull: false
    },
    isEmailVerified: {
      type: Sequelize.BOOLEAN,
      allowNull: false
    },
    isAdmin: {
      type: Sequelize.BOOLEAN,
      allowNull: false
    }
  },
  {
    freezeTableName: false,
    timestamps: true,
    indexes: [
      {
        fields: ['userId']
      },
      {
        fields: ['email']
      }
    ]
  }
);

module.exports = User;
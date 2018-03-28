'use strict';
const config = require('../config');
const Sequelize = require('sequelize');
const sequelize = new Sequelize(
  config.MYSQL_DB,
  config.MYSQL_USER,
  config.MYSQL_PASSWORD,
  {
    host: config.MYSQL_HOST,
    dialect: 'mysql',
    pool: config.MYSQL_CONNECTIONPOOL,
    logging: !(process.env.NODE_ENV === 'production'),
    operatorsAliases: false
  }
);

module.exports = {
  database: sequelize,
  Sequelize: Sequelize
};
'use strict';

const config = {
  MYSQL_HOST: 'localhost',
  MYSQL_DB: 'nn_douga',
  MYSQL_USER: 'root',
  MYSQL_PASSWORD: 'mysql',
  MYSQL_CONNECTIONPOOL: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000
  },
  SECRET: 'steS6av@*uya',
  BCRYPT_ROUNDS: 15,
  REDIS_HOST: 'localhost',
  REDIS_PORT: 6379
};

module.exports = config;
'use strict';

const config = {
  WEBSERVER_URL_ROOT: 'http://localhost:8000/',
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
  REDIS_PORT: 6379,
  MAILGUN_API_KEY: 'key-ab89f08d2dd7ae2e0d140e2ad6d7bf39',
  MAILGUN_DOMAIN: 'sandbox7d99ec903b5e4de5b8946826268e4404.mailgun.org'
};

module.exports = config;
const express = require('express');
const router = express.Router();
const apiTokenGenerator = require('../lib/apiTokenGenerator');
const authenticationEnsurer = require('./authenticationEnsurer');
const config = require('../config');

router.get('/', authenticationEnsurer, (req, res, next) => {
  let email = '', apiToken = '';
  if (req.user) {
    email = req.user.email;
    apiToken = apiTokenGenerator(req.user.userId, 60 * 60 * 24);
  }
  res.render('upload', {
    email: email,
    apiToken: apiToken,
    config: config,
    user: req.user
  });
});

module.exports = router;
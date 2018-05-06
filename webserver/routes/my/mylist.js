const express = require('express');
const router = express.Router();
const apiTokenGenerator = require('../../lib/apiTokenGenerator');
const authenticationEnsurer = require('../authenticationEnsurer');
const config = require('../../config');

module.exports = router;

router.get('/', authenticationEnsurer, (req, res, next) => {
  let email = '';
  let apiToken = '';

  if (req.user) {
    email = req.user.email;
    apiToken = apiTokenGenerator(req.user.userId, 60 * 60 * 24);
  }

  res.render('my/mylist', {
    email: email,
    apiToken: apiToken,
    config: config,
    user: req.user
  });
});
const express = require('express');
const router = express.Router();
const moment = require('moment');
const apiTokenGenerator = require('../lib/apiTokenGenerator');
const authenticationEnsurer = require('./authenticationEnsurer');
const config = require('../config');
const User = require('../models/user');
const csrf = require('csurf');
const csrfProtection = csrf({ cookie: true });

module.exports = router;

router.get('/', authenticationEnsurer, csrfProtection, async (req, res, next) => {
  let email = '';
  if (req.user) {
    email = req.user.email;
  }
  const where = { userId: req.user.userId };
  const user = await User.findOne({ where: where });
  const formattedCreateAt = moment(user.createdAt).format('YYYY/MM/DD HH:mm');
  const formattedUpdatedAt = moment(user.updatedAt).format('YYYY/MM/DD HH:mm');

  res.render('settings', {
    email: email,
    config: config,
    user: user,
    formattedCreateAt: formattedCreateAt,
    formattedUpdatedAt: formattedUpdatedAt,
    csrfToken: req.csrfToken()
  });
});

router.post('/', authenticationEnsurer, csrfProtection, async (req, res, next) => {
  const userName = req.body.userName;
  const where = { userId: req.user.userId };
  const user = await User.findOne({ where: where });
  await User.update({ userName: userName.substring(0, 255) }, { where: where });
  res.redirect('/settings');
});
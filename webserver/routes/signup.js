const express = require('express');
const router = express.Router();
const User = require('../models/user');
router.get('/', (req, res, next) => {
  res.render('signup/index.pug', {
    user: req.user
  });
});

module.exports = router;
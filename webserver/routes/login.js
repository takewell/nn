const express = require('express');
const passport = require('passport');
const router = express.Router();

module.exports = router;

router.get('/', (req, res, next) => {
  res.render('login', {
    user: req.user
  });
});

router.post('/', passport.authenticate('local', { successRedirect: '/', failureRedirect: '/login', failureFlash: false }));

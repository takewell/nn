const express = require('express');
const router = express.Router();

module.exports = router;

router.get('/', (req, res, next) => {
  res.render('login', {
    user: req.user
  });
});
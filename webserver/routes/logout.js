const express = require('express');
const router = express.Router();

module.exports = router;

router.get('/', (req, res, next) => {
  req.logout();
  res.redirect('/');
});
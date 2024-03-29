const express = require('express');
const router = express.Router();
const config = require('../config');
const apiTokenGenerator = require('../lib/apiTokenGenerator');

module.exports = router;

router.get('/', (req, res, next) => {
  let email = '';
  let apiToken = '';
  if (req.user) {
    email = req.user.email;
    // 72hの実行期限
    apiToken = apiTokenGenerator(req.user.userId, 60 * 60 * 24);
  }

  res.render('index', { title: 'エヌエヌ動画', email: email, apiToken: apiToken, user: req.user, config: config });
});

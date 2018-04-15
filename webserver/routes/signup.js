const express = require('express');
const router = express.Router();
const User = require('../models/user');
const passwordDigestClient = require('../lib/passwordDigestClient');
const mailSender = require('./mailSender');
router.get('/', (req, res, next) => {
  res.render('signup/index.pug', {
    user: req.user
  });
});

router.post('/', (req, res, next) => {
  const email = req.body.email.trim();
  const password = req.body.password.trim();
  const repassword = req.body.repassword.trim();
  // このあたりのバリデーションは フロントエンド側でやりたい。
  if (!email) {
    res.render('signup/index.pug', {
      errorMessage: 'メールアドレスを入力して下さい',
      user: req.user
    });
  } else if (password != repassword) {
    res.render('signup/index.pug', {
      errorMessage: '再入力のパスワードが同じではありません',
      user: req.user
    });
  } else {
    passwordDigestClient.create(password)
      .then(async (passwordDigest) => {
        const user = await User.findOne({ where: { email: email } });
        if (user) {
          res.render('signup/index.pug', {
            errorMessage: 'すでに登録されているメールアドレスです。'
          });
        } else {
          const user = await User.create({
            email: email,
            passwordDigest: passwordDigest,
            isEmailVerified: false,
            isAdmin: false
          });
          mailSender(email);
          req.login(user, (err) => {
            if (err) next(err);
            return res.render('signup/mailsendmessage.pug', {
              email: email, user: req.user
            });
          });
        }
      });
  }
});

module.exports = router;
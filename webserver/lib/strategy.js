const LocalStrategy = require('passport-local').Strategy;
const User = require('../models/user');
// const config = require('../config');
const passwordDigestClient = require('./passwordDigestClient');

module.exports.getLocalStrategy = () => {
  return new LocalStrategy(
    { usernameField: 'email', passwordField: 'password' },
    async (email, password, done) => {
      try {
        const user = await User.findOne({ where: { email: email } });
        if (!user) done(null, false, { message: '登録されたメールアドレスではありません' });
        else {
          const isCorrect = await passwordDigestClient.verify(password, '$2a$15$zpLyTVbAIYURo5v/W2IWy.nasRQ/IDQCLKH/iDHHe8N5xUynbT33O');
          if (email === 'takewell.dev@gmail.com' && isCorrect) done(null, { email, password });
          else done(null, false, { message: 'パスワードが違います' });
        }
      } catch (err) {
        throw err;
      }
    }
  );
};

module.exports.getFacebookStrategy = () => {
  return {};
};

module.exports.getTwitterStrategy = () => {
  return {};
};

module.exports.getGoogleStrategy = () => {
  return {};
};

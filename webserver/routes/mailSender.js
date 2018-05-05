const config = require('../config');
const jwt = require('jsonwebtoken');
const mailgun = require('mailgun-js')({
  apiKey: config.MAILGUN_API_KEY,
  domain: config.MAILGUN_DOMAIN
});

module.exports = (email) => {
  const token = jwt.sign({ email: email }, config.SECRET);
  const url = config.WEBSERVER_URL_ROOT + 'signup/emailverify?token=' + token;

  const data = {
    from: 'エヌエヌ動画 <nn@mailgun.org>',
    to: email, // Need add Recipent fo Mailgun
    subject: '【エヌエヌ動画】メールアドレスの確認',
    text: url + '\n以上の URL からアクセスして下さい。'
  };

  mailgun.messages().send(data, (err, body) => {
    if (err) {
      console.log(err);
      return;
    }
    console.log('Mail sended.');
    console.log(body);
  });

};
const config = require('../config');
const jwt = require('jsonwebtoken');

/**
 * リクエストから apiToken のデコードを行い、デコードできない場合には null を返す
 * @param {*} req
 * @return {*} { userId: 'UserId' , expire: unixtime }
 */
function decode(req) {
  const authrizationHeader = req.get('Authorization');
  const apiToken = authrizationHeader.split('Bearer ')[1];

  let decoded = null;
  try {
    decoded = jwt.verify(apiToken, config.SECRET);
  } catch (err) {
    console.log('Api Token Decode Error:');
    console.log(err);
  }

  return decoded;
}

module.exports = decode;
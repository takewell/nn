const bcrypt = require('bcrypt');
const config = require('../config');
const saltRouds = config.BCRYPT_ROUNDS;

module.exports.create = (password) => {
  const saltPromise = bcrypt.genSalt(saltRouds);
  return saltPromise.then(salt => {
    return bcrypt.hashSync(password, salt);
  });
};

module.exports.verify = (password, passwordDigest) => {
  return bcrypt.compare(password, passwordDigest);
};
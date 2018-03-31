const bcrypt = require('bcrypt');
const config = require('../config');
const saltRouds = config.BCRYPT_ROUNDS;

const create = (password) => {
  const saltPromise = bcrypt.genSalt(saltRouds);
  return saltPromise.then(salt => {
    return bcrypt.hashSync(password, salt);
  });
};

const verify = (password, passwordDigest) => {
  return bcrypt.compare(password, passwordDigest);
};

module.exports = {
  create: create,
  verify: verify
};
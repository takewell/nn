const assert = require('assert');
const User = require('../models/user');

describe('User.find', () => {
  it('', () => {
    User.findOne({
      where: {
        email: 'test@email.com'
      }
    }).then(user => {
      assert(user === null);
    });
  });
});
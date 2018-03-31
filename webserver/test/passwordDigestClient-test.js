const assert = require('assert');
const passwordDigestClient = require('../lib/passwordDigestClient');

describe('passwordDigestClient', () => {
  it('', () => {
    passwordDigestClient.create('password').then((passwordDigest) => {
      passwordDigestClient.verify('password', passwordDigest).then((res) => {
        assert(res);
      });
    });

  });
});
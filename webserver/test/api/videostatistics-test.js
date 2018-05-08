'use strict';
const request = require('request');
const apiTokenGenerator = require('../../lib/apiTokenGenerator');
const masterUserId = 2;

request({
  url: 'http://localhost:8000/v1/videos/73c90fd0-63ca-4d88-b6f4-d90e312f5252/videostatistics',
  method: 'GET',
  headers: {
    Authorization: 'Bearer ' + apiTokenGenerator(masterUserId, 60 * 60 * 24 * 3), 'Content-Type': 'application/json'
  },
  json: true
}, (err, res, body) => {
  if (err) throw err;
  console.log(body);
});

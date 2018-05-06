'use strict';
const request = require('request');
// const assert = require('assert');
const apiTokenGenerator = require('../../lib/apiTokenGenerator');
const masterUserId = 2;

// ユーザーはまずマイリストを作成する
// ユーザーはマイリストを閲覧する
// ユーザーはマイリストを削除する

(() => {
  postRequest();
  getRequest();
  setTimeout(() => deleteRequest(), 1000 * 2);
})();

function getRequest() {
  return request({
    url: 'http://localhost:8000/v1/my/mylist',
    method: 'GET',
    headers: {
      Authorization: 'Bearer ' + apiTokenGenerator(masterUserId, 60 * 60 * 24 * 3), 'Content-Type': 'application/json'
    },
    json: true
  }, (err, res, body) => {
    if (err) throw err;
    console.log(body);
    return body;
  });
}

function postRequest() {
  request({
    url: 'http://localhost:8000/v1/my/mylist',
    method: 'POST',
    headers: {
      Authorization: 'Bearer ' + apiTokenGenerator(masterUserId, 60 * 60 * 24 * 3), 'Content-Type': 'application/json'
    },
    json: true,
    body: {
      videoId: "73c90fd0-63ca-4d88-b6f4-d90e312f5252"
    }
  }, (err, res, body) => {
    if (err) throw err;
    console.log(body);
    return body;
  });
}

function deleteRequest() {
  return request({
    url: 'http://localhost:8000/v1/my/mylist',
    method: 'DELETE',
    headers: {
      Authorization: 'Bearer ' + apiTokenGenerator(masterUserId, 60 * 60 * 24 * 3), 'Content-Type': 'application/json'
    },
    json: true,
    body: {
      videoId: "73c90fd0-63ca-4d88-b6f4-d90e312f5252"
    }
  }, (err, res, body) => {
    if (err) throw err;
    console.log(body);
    return body;
  });
}
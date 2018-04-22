import 'bootstrap';
import * as Pixi from 'pixi.js';
import React from 'react';
import ReactDOM from 'react-dom';
import Uploader from './uploader.js';
import MyVideoTable from './myVideoTable.js';

const uploaderDivided = document.getElementById('dropbox-container');
if (uploaderDivided) {
  ReactDOM.render(
    <Uploader
      apiToken={uploaderDivided.dataset.apiToken}
      mediaserverUrlRoot={uploaderDivided.dataset.mediaserverUrlRoot}
    />,
    uploaderDivided
  );
}

const myVideoTableDivided = document.getElementById('my-video-table');
if (myVideoTableDivided) {
  ReactDOM.render(
    <MyVideoTable apiToken={myVideoTableDivided.dataset.apiToken} />,
    myVideoTableDivided
  );
}
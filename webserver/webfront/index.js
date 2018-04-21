import 'bootstrap';
import * as Pixi from 'pixi.js';
import React from 'react';
import ReactDOM from 'react-dom';
import Uploader from './uploader.js';

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
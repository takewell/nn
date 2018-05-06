import 'bootstrap';
import * as Pixi from 'pixi.js';
import React from 'react';
import ReactDOM from 'react-dom';
import Uploader from './uploader.js';
import MyVideoTable from './myVideoTable.js';
import VideoPlayer from './videoPlayer.js';
import CommentPoster from './commentPoster';
import CommentTable from './commentTable.js';
import CommentRenderer from './commentRenderer';

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

const videoContainerDivided = document.getElementById('video-containar');
if (videoContainerDivided) {
  ReactDOM.render(
    <VideoPlayer
      autoplay={videoContainerDivided.dataset.autoplay}
      mpdUrl={videoContainerDivided.dataset.mpdUrl}
      apiToken={videoContainerDivided.dataset.apiToken}
      videoPlayerId={videoContainerDivided.dataset.videoPlayerId}
      height={videoContainerDivided.dataset.height}
      width={videoContainerDivided.dataset.width}
    />,
    videoContainerDivided
  );
}

/** 
 * コメントの追加が行われたときに通知するリスナーリスト
 * @param {array} comments
 * @param {string} eventName
 */
const commentListenerContainer = {
  listeners: []
};

const commentPosterDivided = document.getElementById('comment-poster');
if (commentPosterDivided) {
  ReactDOM.render(
    <CommentPoster
      videoId={commentPosterDivided.dataset.videoId}
      videoPlayerId={commentPosterDivided.dataset.videoPlayerId}
      apiToken={commentPosterDivided.dataset.apiToken}
      commentListenerContainer={commentListenerContainer}
    />,
    commentPosterDivided
  );
}

const commentTableDivided = document.getElementById('comment-table');
if (commentTableDivided) {
  ReactDOM.render(
    <CommentTable
      videoId={commentTableDivided.dataset.videoId}
      videoPlayerId={commentTableDivided.dataset.videoPlayerId}
      apiToken={commentTableDivided.dataset.apiToken}
      commentListenerContainer={commentListenerContainer}
    />,
    commentTableDivided
  );
}

if (videoContainerDivided) {
  window.CommentRenderer = new CommentRenderer(
    commentListenerContainer,
    videoContainerDivided.dataset.videoPlayerId
  );
  window.CommentRenderer.init();
}

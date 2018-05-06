import * as Pixi from 'pixi.js';

/**
 * コメントレンダラー
 */
export default class CommentRenderer {
  constructor(commentListenerContainer, videoPlayerId) {
    this.commentListenerContainer = commentListenerContainer;
    this.videoPlayerId = videoPlayerId;
    this.comments = [];
    this.laneIndexSet = new Set();
    this.objSet = new Set();
    this.isPlaying = false;

    this.fontSize = 24;
    this.controllerHeight = 30;
    this.showRangeCentiSeconds = 100; // 現在の時間から表示させるセンチ秒

    this.textStyle = new PIXI.TextStyle({
      fontFamily: 'Arial',
      fontSize: this.fontSize,
      fontStyle: 'normal',
      fontWeight: 'normal',
      fill: ['#ffffff', '#ffffff'], // gradient
      stroke: '#000000',
      strokeThickness: 1,
      dropShadow: true,
      dropShadowColor: '#000000',
      dropShadowBlur: 2,
      dropShadowAngle: Math.PI / 6,
      dropShadowDistance: 2,
      wordWrap: false,
      wordWrapWidth: 100
    });

    this.commentListenerContainer.listeners.push((comments, eventName) => {
      this.comments = this.comments.concat(comments);

      if (eventName === 'commentpost') {
        // コメント投稿後はソートし直して、レンダリングに足す
        this.comments = this.comments.sort((a, b) => {
          return a.videoPosition - b.videoPosition;
        });
      }

      // console.info(this.comments);
      this.addText(this.fetchRenderedComment());
    });
  }

  init() {
    const videoContainer = document.getElementById('video-containar');
    this.videoPlayer = document.getElementById(this.videoPlayerId);
    this.app = new PIXI.Application(
      this.videoPlayer.clientWidth,
      this.videoPlayer.clientHeight - this.controllerHeight,
      { transparent: true }
    );
    videoContainer.appendChild(this.app.view);
    this.app.view.style = 'position: absolute; top: 0px; left: 0px;';

    this.laneCount = Math.floor(
      (this.videoPlayer.clientHeight - this.controllerHeight) / this.fontSize
    );

    this.videoPlayer.addEventListener('play', this.playHandler.bind(this));
    this.videoPlayer.addEventListener('pause', this.pauseHandler.bind(this));
    this.videoPlayer.addEventListener('ended', this.pauseHandler.bind(this));
    this.videoPlayer.addEventListener('seeked', this.seekHandler.bind(this));

    this.app.ticker.add(() => {
      if (this.isPlaying) {
        const renderedComments = this.fetchRenderedComment();
        this.addText(renderedComments);
        Array.from(this.objSet).forEach(this.updatePosition.bind(this));
      }
    });
  }

  playHandler(event) {
    const renderedComments = this.fetchRenderedComment();
    this.addText(renderedComments);
    this.isPlaying = true;
  }

  pauseHandler(event) {
    this.isPlaying = false;
  }

  seekHandler(event) {
    this.laneIndexSet = new Set();
    Array.from(this.objSet).forEach(obj => {
      obj.destroy();
      this.objSet.delete(obj);
    });
    this.comments.forEach(comment => {
      comment.isFetched = false; // シークしたら描画用フェッチを一旦リセット
    });
  }

  fetchRenderedComment() {
    const renderedComments = [];
    for (let i = 0; i < this.comments.length; i++) {
      const comment = this.comments[i];
      const currentTime = this.videoPlayer.currentTime * 100;
      const vpos = comment.videoPosition;

      if (!comment.isFetched) {
        const isInShowRange =
          currentTime - this.showRangeCentiSeconds <= vpos &&
          vpos < currentTime;
        if (isInShowRange) {
          comment.isFetched = true; // 一度追加したものかはマーク
          renderedComments.push(comment);
        }
      }

      if (currentTime <= vpos) break;
    }

    return renderedComments;
  }

  popRandomFromSet() {
    if (this.laneIndexSet.size === 0) {
      // 中身がない時は初期化
      for (let i = 0; i < this.laneCount; i++) {
        this.laneIndexSet.add(i);
      }
    }
    const randomIndex = Math.floor(Math.random() * this.laneIndexSet.size);
    const index = Array.from(this.laneIndexSet)[randomIndex];
    this.laneIndexSet.delete(index);
    return index;
  }

  addText(renderedComments) {
    renderedComments.forEach(comment => {
      const text = new PIXI.Text(comment.content, this.textStyle);
      this.objSet.add(text);
      const index = this.popRandomFromSet();
      const y = index * this.fontSize;
      const cWidth = this.videoPlayer.clientWidth;

      text.y = y;
      text.x = cWidth;
      this.app.stage.addChild(text);

      if (comment.isSelfPosted) {
        // 自身の投稿に黄色い枠線を付ける
        const graphics = new PIXI.Graphics();
        graphics.lineStyle(1, 0xffff00, 1);
        graphics.drawRect(0, 0, text.width, text.height);
        const sprite = new PIXI.Sprite(graphics.generateCanvasTexture());
        sprite.x = text.x;
        sprite.y = text.y;
        this.objSet.add(sprite);
        this.app.stage.addChild(sprite);
      }

    });
  }

  updatePosition(obj) {
    if (this.isPlaying) {
      const moveDiff = -3;
      obj.x += moveDiff; // 左少し移動

      if (obj.x < -obj.width) {
        // テキストが左側で消えたらTextを消滅させる
        obj.destroy();
        this.objSet.delete(obj);
      }
    }
  }
}
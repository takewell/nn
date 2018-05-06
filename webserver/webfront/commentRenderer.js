import * as Pixi from 'pixi.js';

/**
 * コメントレンダラー
 */
export default class CommentRenderer {
  constructor(commentListenerContainer, videoPlayerId) {
    this.commentListenerContainer = commentListenerContainer;
    this.videoPlayerId = videoPlayerId;
    this.comments = [];
    this.objSet = new Set();

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

    this.app.ticker.add(() => {
      const renderedComments = this.fetchRenderedComment();
      this.addText(renderedComments);
      Array.from(this.objSet).forEach(this.updatePosition.bind(this));
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

  addText(renderedComments) {
    renderedComments.forEach(comment => {
      const text = new PIXI.Text(comment.content, this.textStyle);
      this.objSet.add(text);
      const cWidth = this.videoPlayer.clientWidth;

      text.y = 0;
      text.x = cWidth;
      this.app.stage.addChild(text);
    });
  }

  updatePosition(obj) {
    const moveDiff = -3;
    obj.x += moveDiff; // 左少し移動

    if (obj.x < -obj.width) {
      // テキストが左側で消えたらTextを消滅させる
      obj.destroy();
      this.objSet.delete(obj);
    }
  }

}
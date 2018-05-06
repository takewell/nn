import * as Pixi from 'pixi.js';

/**
 * コメントレンダラー
 */
export default class CommentRenderer {
  constructor(commentListenerContainer, videoPlayerId) {
    this.commentListenerContainer = commentListenerContainer;
    this.videoPlayerId = videoPlayerId;
    this.fontSize = 24;
    this.controllerHeight = 30;
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

    const text = new PIXI.Text('コメント描画のテスト', this.textStyle);
    text.x = 0;
    text.y = 0;
    this.app.stage.addChild(text);
  }
}
import React from 'react';
import dashjs from 'dashjs';

/**
 * 動画再生プレイヤーのコンポーネント
 */
export default class VideoPlayer extends React.Component {
  constructor(props) {
    super(props);
  }

  componentDidMount() {
    const url = this.props.mpdUrl;
    const apiToken = this.props.apiToken;
    const player = dashjs.MediaPlayer().create();
    player.extend(
      'RequestModifier',
      () => {
        return {
          modifyRequestHeader: xhr => {
            xhr.setRequestHeader('Authorization', 'Bearer ' + apiToken);
            return xhr;
          },
          modifyRequestURL: url => {
            return url;
          }
        };
      },
      true
    );
    player.getDebug().setLogToBrowserConsole(false);
    player.initialize(
      document.getElementById(this.props.videoPlayerId),
      url,
      this.props.autoplay
    );
  }

  render() {
    return (
      <video
        id={this.props.videoPlayerId}
        className="border"
        controls
        height={this.props.height}
        width={this.props.width}
      />
    );
  }
}
import moment from 'moment';
import React from 'react';
import VideoPlayer from './videoPlayer.js';

export default class RecentVideoArea extends React.Component {
  constructor(props) {
    super(props);
    this.state = { videos: [] };
  }

  componentDidMount() {
    this.updateVideos();
  }

  updateVideos() {
    fetch('/v1/videos/', {
      headers: { Authorization: 'Bearer ' + this.props.apiToken }
    })
      .then(res => res.json())
      .then(json => {
        this.setState((prevState, props) => ({
          videos: json
        }));
      })
      .catch(e => {
        console.error(e);
      });
  }

  render() {
    const videos = this.state.videos.map(video => {
      const mpdUrl = this.props.mediaserverUrlRoot + 'v1/videos/' + video.videoId + '.mpd';
      const watchUrl = '/watch/' + video.videoId;
      let userNameLabel = '投稿者: 匿名さん';
      if (video.user.userName) {
        userNameLabel = '投稿者: ' + video.user.userName + 'さん';
      }

      let videoStatistic = { playCount: 0, commentCount: 0, myListCount: 0 };
      if (video.videostatistic) {
        videoStatistic = video.videostatistic;
      }

      return (
        <div className="card col-md-4 p-0" key={video.videoId}>
          <div className="card-body">
            <h4>
              <a href={watchUrl}>{video.title}</a>
            </h4>
            <p className="recent-text">{userNameLabel}</p>
            <div className="text-center">
              <a href={watchUrl}>
                <VideoPlayer
                  width={240}
                  height={135}
                  videoPlayerId={video.videoId}
                  mpdUrl={mpdUrl}
                  apiToken={this.props.apiToken}
                  autoplay={false}
                />
              </a>
            </div>
            <p className="recent-text text-center pt-2">
              <span>再生数: {videoStatistic.playCount} </span>
              <span>コメント数: {videoStatistic.commentCount} </span>
              <span>マイリスト数: {videoStatistic.myListCount} </span>
            </p>
          </div>
        </div>
      );
    });

    return <div className="row mb-0 pt-4">{videos}</div>;
  }
}
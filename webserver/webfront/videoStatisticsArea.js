import moment from 'moment';
import React from 'react';

export default class VideoStatisticsArea extends React.Component {
  constructor(props) {
    super(props);
    this.state = { playCount: '', commentCount: '', myListCount: '' };
  }

  componentDidMount() {
    this.updateVideoStat();
  }

  async updateVideoStat() {
    try {
      const res = await fetch(`/v1/videos/${this.props.videoId}/videostatistics`, {
        headers: {
          Authorization: `Bearer ${this.props.apiToken}`,
          'Content-Type': 'application/json'
        }
      });
      const json = await res.json();
      this.setState((prevState, props) => ({
        playCount: json.playCount,
        commentCount: json.commentCount,
        myListCount: json.myListCount
      }));
    } catch (e) {
      console.error(e);
    }
  }

  render() {
    return (
      <div className="row">
        <div className="col-md-4 pt-2 pb-2">
          <h6 className="card-subtitle mb-2 text-muted">再生数</h6>
          <p className="card-text">{this.state.playCount}</p>
        </div>
        <div className="col-md-4 pt-2 pb-2">
          <h6 className="card-subtitle mb-2 text-muted">コメント数</h6>
          <p className="card-text">{this.state.commentCount}</p>
        </div>
        <div className="col-md-4 pt-2 pb-2">
          <h6 className="card-subtitle mb-2 text-muted">マイリスト数</h6>
          <p className="card-text">{this.state.myListCount}</p>
        </div>
      </div>
    );
  }

}
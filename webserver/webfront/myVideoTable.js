import moment from 'moment';
import React from 'react';

/**
 * 自分の投稿した動画一覧を表示するのコンポーネント
 */
export default class MyVideoTable extends React.Component {
  constructor(props) {
    super(props);
    this.state = { myVideos: [] };
  }

  componentDidMount() {
    this.updateMyVideos();
    this.timerID = setInterval(() => { this.updateMyVideos(); }, 5000);
  }

  componentWillUnmount() {
    clearInterval(this.timerID);
  }

  updateMyVideos() {
    fetch('/v1/my/videos', {
      headers: { Authorization: 'Bearer ' + this.props.apiToken }
    })
      .then(res => res.json())
      .then(json => {
        this.setState((prevState, props) => ({
          myVideos: json
        }));
      })
      .catch(e => {
        console.error(e);
      });
  }

  render() {
    const myVideos = this.state.myVideos.map((myVideo) => {
      const formattedCreatedAt = moment(myVideo.createdAt).format('YYYY/MM/DD HH:mm:ss');
      let operationLink = <div />;
      if (myVideo.videoStatus === 'Published' || myVideo.videoStatus === 'Encoded') {
        operationLink = (
          <a href={'/my/videos/' + myVideo.videoId}>編集及び公開</a>
        );
      }
      return (
        <tr key={myVideo.videoId}>
          <td>
            <a href={'/watch/' + myVideo.videoId}>{myVideo.videoId}</a>
          </td>
          <td>{myVideo.title}</td>
          <td>{myVideo.videoStatus}</td>
          <td>{formattedCreatedAt}</td>
          <td>{myVideo.userId}</td>
          <td>{operationLink}</td>
        </tr>
      );
    });

    return (
      <table>
        <tbody>
          <tr>
            <th>ID</th>
            <th>タイトル</th>
            <th>ステータス</th>
            <th>投稿日時</th>
            <th>投稿者ID</th>
            <th>操作</th>
          </tr>
          {myVideos}
        </tbody>
      </table>
    );
  }
}
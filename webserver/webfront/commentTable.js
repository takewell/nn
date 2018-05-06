import moment from 'moment';
import React from 'react';

export default class CommentTabel extends React.Component {
  constructor(props) {
    super(props);
    this.state = { comments: [] };
    this.commnetListener = (comments, eventName) => {
      if (eventName === 'commentpost') {
        this.setState((prevState, props) => {
          const newComments = prevState.comments.concat(comments);
          const sortedNewComments = newComments.sort((a, b) => {
            return a.videoPosition - b.videoPosition;
          });
          return { comments: sortedNewComments };
        });
      }
    };
    this.props.commentListenerContainer.listeners.push(this.commnetListener);
  }

  componentDidMount() {
    this.updateComments();
  }

  formatDigit(number) {
    return `0${number}`.slice(-2);
  }

  async updateComments() {
    const selfListener = this.commnetListener;
    const listenerContainer = this.props.commentListenerContainer;

    try {
      const res = await fetch(`/v1/videos/${this.props.videoId}/comments`, {
        headers: { Authorization: `Bearer ${this.props.apiToken}` }
      });
      const json = await res.json();
      listenerContainer.listeners.forEach((listener) => {
        if (listener === selfListener) return;
        listener(json, 'fetchcomments');
      });
      this.setState({ comments: json });
    } catch (e) {
      console.error(e);
    }
  }

  render() {
    const commentItems = this.state.comments.map((comment) => {
      const dateString = moment(comment.createdAt).format('MM/DD HH:mm');
      const vposSec = Math.floor(comment.videoPosition / 100);
      const vposString = `${this.formatDigit(Math.floor(vposSec / 60))}:${this.formatDigit(vposSec % 60)}`;

      return (
        <tr className="ct" key={comment.commentId}>
          <td className="ct td-cm">{comment.content}</td>
          <td className="ct td-pt">{vposString}</td>
          <td className="ct td-ud">{dateString}</td>
        </tr>
      );
    });

    return (
      <table className="table-sm table-striped img-thumbnail">
        <thead className="comment-table">
          <tr className="ct">
            <th className="ct th-cm" scope="col">
              コメント
            </th>
            <th className="ct th-pt" scope="col">
              再生時間
            </th>
            <th className="ct th-ud" scope="col">
              書込時刻
            </th>
          </tr>
        </thead>
        <tbody className="comment-table">{commentItems}</tbody>
      </table>
    );

  }
}
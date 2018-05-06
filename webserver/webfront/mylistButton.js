import React from 'react';

export default class MylistButton extends React.Component {
  constructor(props) {
    super(props);
  }

  async componentDidMount() {
    const button = document.getElementById('mylist-button');
    const videoId = this.props.videoId;
    const apiToken = this.props.apiToken;
    const mylist = { videoId: videoId };

    try {
      // すでにマイリストチェック済みかチェックする
      const res = await fetch(`/v1/my/mylist`, {
        headers: {
          Authorization: `Bearer ${apiToken}`,
          'Content-Type': 'application/json'
        }
      });

      const mylistitems = await res.json();
      let isAlreadyMylisted = false;
      mylistitems.forEach(i => {
        if (i.videoId === videoId) {
          isAlreadyMylisted = true;
        }
      });

      if (!isAlreadyMylisted) {
        button.disabled = '';
      } else {
        button.innerText = 'マイリスト追加済み';
      }
    } catch (e) {
      console.error(e);
    }

    button.addEventListener('click', mylistVideo);

    async function mylistVideo() {
      try {
        const res = await fetch('/v1/my/mylist', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${apiToken}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(mylist)
        });

        const json = await res.json();

        button.disabled = 'true';
        button.innerText = 'マイリスト追加済み';
      } catch (e) {
        console.error(e);
      }

    }

  }

  render() {
    return (
      <button id="mylist-button" className="btn btn-primary btn-sm" type="button" disabled >
        マイリスト追加
      </button>
    );
  }
}
import Dropzone from 'dropzone';
import React from 'react';
import ReactDOM from 'react-dom';

/**
 * Uploader
 * 動画ファイルをアップロードするコンポーネント
 */
export default class Uploader extends React.Component {
  constructor(props) {
    super(props);
  }

  componentDidMount() {
    Dropzone.options.videoUploadDropzone = {
      paramName: 'file',
      maxFilesize: 3000, // MB
      dictDefaultMessage: 'このエリアに動画ファイルをドラッグアンドドロップしてください<br> 3GB までの動画をアップロードできます。',
      init: function () {
        let hasError = false;
        this.on('addedfile', (file) => {
          hasError = false;
          $('.dz-details').remove();
          $('.dz-progress').remove();
          $('.dz-error-message').remove();
          $('.dz-success-mark').remove();
          $('.dz-error-mark').remove();
        });

        this.on('complete', (file) => {
          if (!hasError && this.getUploadingFiles().length === 0 && this.getQueuedFiles().length === 0) {
            setTimeout(() => {
              window.location.href = 'my/videos';
            }, 300);
          }
        });

        this.on('error', (file, response) => {
          hasError = true;
          alert('アップロードに失敗しました。');
          console.error('Uploader Error:');
          console.error(file);
          console.error(response);
        });
      },
      accept: function (file, done) {
        done();
        $('.dz-details').remove();
        $('.dz-progress').remove();
        $('.dz-error-message').remove();
        $('.dz-success-mark').remove();
        $('.dz-error-mark').remove();
      }
    };
  }

  render() {
    const postUrl = this.props.mediaserverUrlRoot + 'v1/vedeos';
    return (
      <form className="dropzone" action={postUrl} method="POST" id="vedeoUploadDropzone" >
        <input type="hidden" name="apiToken" value="{this.props.apiToken}" />
      </form>
    );
  }
};
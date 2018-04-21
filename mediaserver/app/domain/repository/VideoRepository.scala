package domain.repository

import domain.entity.Video

import scala.concurrent.Future


trait VideoRepository {

  /**
    * 動画のプロパティを保存する
    *
    * @param video 保存する動画のプロパティ値
    */
    def create(video: Video): Future[Unit]

    /**
      * 動画のプロパティを更新する
    * ただし、タイトル、説明文などの更新は行わない
    * @param video
    * @return
    */
    def update(video: Video): Future[Unit]

}
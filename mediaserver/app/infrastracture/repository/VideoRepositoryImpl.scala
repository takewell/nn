package infrastracture.repository

import domain.entity.Video
import domain.repository.VideoRepository
import scalikejdbc._

import scala.concurrent.Future
import scala.util.Try

class VideoRepositoryImpl extends VideoRepository {
  /**
    * 動画のプロパティを保存する
    *
    * @param video 保存する動画のプロパティ値
    */
  override def create(video: Video): Future[Unit] = {
    Future.fromTry(Try {
      using(DB(ConnectionPool.borrow())) { db =>
        db.localTx { implicit session =>
          val sql =
            sql"""INSERT INTO videos (
                 | videoId,
                 | title,
                 | description,
                 | contentType,
                 | videoStatus,
                 | userId,
                 | createdAt,
                 | updatedAt
                 | ) VALUES (
                 | ${video.videoId},
                 | null,
                 | null,
                 | ${video.contentType},
                 | ${video.status.value},
                 | ${video.userId},
                 | ${video.createdAt},
                 | ${video.updatedAt}
                 | )
              """.stripMargin
          sql.execute().apply()
        }
      }
    })
  }

    /**
      * 動画のプロパティを更新する
    * ただし、タイトル、説明文などの更新は行わない
    *
    * @param video 保存する動画のプロパティ値
    */
      override def update(video: Video): Future[Unit] = {

          Future.fromTry(Try {
            using(DB(ConnectionPool.borrow())) { db =>
                db.localTx { implicit session =>
                    val sql =
                        sql"""UPDATE videos SET
                 | contentType = ${video.contentType},
                 | videoStatus = ${video.status.value},
                 | userId = ${video.userId},
                 | createdAt = ${video.createdAt},
                 | updatedAt = ${video.updatedAt}
                 | WHERE videoId = ${video.videoId}
              """.stripMargin
                    sql.update().apply()
                  }
              }
          })
      }

}
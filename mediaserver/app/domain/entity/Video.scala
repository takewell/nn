package domain.entity

import java.time.LocalDateTime

import play.api.libs.json.{Json, Writes}


case class Video(videoId: String,
                 contentType: String,
                 userId: Long,
                 status: VideoStatus,
                 createdAt: LocalDateTime,
                 updatedAt: LocalDateTime)

object Video {
  implicit val writes: Writes[Video] = Json.writes[Video]
}
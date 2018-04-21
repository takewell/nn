package controllers

import java.nio.file.{FileSystems, Files, StandardCopyOption}
import java.time.{Clock, LocalDateTime}
import java.util.UUID
import javax.inject._

import akka.actor.ActorRef
import akka.stream.scaladsl.{FileIO, Source}
import akka.util.ByteString
import domain.entity.{Video, VideoStatus}
import domain.repository.VideoRepository
import infrastructure.actor.EncodeStartMessage
import play.api.Configuration
import play.api.mvc._
import play.api.libs.json.Json
import play.Logger
import pdi.jwt.{Jwt, JwtAlgorithm}
import play.api.http.HttpEntity

import scala.util.Success
import scala.concurrent.Future
import scala.concurrent.ExecutionContext.Implicits.global

@Singleton
class VideosController @Inject()(cc: ControllerComponents,
                                 videoRepository: VideoRepository,
                                 @Named("video-encoder") videoEncoder: ActorRef,
                                 clock: Clock,
                                 configuration: Configuration) extends AbstractController(cc) {

  val secret = configuration.get[String]("nnDouga.secret")
  val allowHeaders = "Accept-Encoding, Connection, Origin, X-Requested-With, Content-Type, Accept, Authorization, Range, If-Range, Cache-Control"


  val originalStoreDirPath = configuration.get[String]("nnDouga.filesystem.original")
  val mpegdashStoreDirPath = configuration.get[String]("nnDouga.filesystem.mpegdash")

  def post() = Action.async { implicit request: Request[AnyContent] =>
    request.body.asMultipartFormData match {
      case Some(form) =>
        (form.file("file"), form.dataParts.get("apiToken")) match {
          case (Some(file), Some(Seq(apiToken))) =>
            val decoded = Jwt.decodeRawAll(apiToken, secret, Seq(JwtAlgorithm.HS256))
            (file.contentType, decoded) match {
              case (Some(ct), Success((_, jsonString, _))) =>
                val json = Json.parse(jsonString)
                val userId = (json \ "userId").validate[Long].get
                val expire = (json \ "expire").validate[Long].get

                if (System.currentTimeMillis() / 1000 <= expire) {
                  val videoId = UUID.randomUUID().toString
                  val originalFilepath = FileSystems.getDefault.getPath(originalStoreDirPath, videoId)
                  Files.copy(file.ref.path, originalFilepath, StandardCopyOption.COPY_ATTRIBUTES)
                  Logger.debug(s"File posted : ${originalFilepath}")
                  Future.successful(Ok(s"File stored."))
                  val now = LocalDateTime.now(clock)
                  val video = Video(
                    videoId,
                    ct,
                    userId,
                    VideoStatus.OriginalFileSubmitted,
                    now,
                    now
                  )
                  val future = videoRepository.create(video)
                  future.foreach { case _ => {
                    videoEncoder ! EncodeStartMessage(video)
                  }}
                  Future.successful(Ok(Json.toJson(Seq(video)))
                    .as("application/json")
                    .withHeaders("Access-Control-Allow-Origin" -> "*",
                      "Access-Control-Allow-Headers" -> allowHeaders))
                } else {
                  Future.successful(BadRequest("Api token expired."))
                }
              case _ => Future.successful(BadRequest("Need file and api token data."))
            }
        }
      case _ => Future.successful(BadRequest("Need form data."))
    }
  }

  def get(fileName: String) = Action.async { implicit request: Request[AnyContent] =>
        val fileNameRegex = """([a-z0-9\-\_]+)(\.)(mpd|mp4)""".r
        val (isValid, isMpd) = fileName match {
          case fileNameRegex(name, dot, ext) => (true, ext == "mpd")
          case _ => (false, false)
        }

          if (!isValid) {
            Future.successful(BadRequest("fileName is not correct."))
          } else if (isMpd) { // mpd is no need authentication
            val filePath = FileSystems.getDefault.getPath(mpegdashStoreDirPath, fileName)
            if (Files.exists(filePath)) {
                val source: Source[ByteString, _] = FileIO.fromPath(filePath)
                Future.successful(Result(
                    header = ResponseHeader(200, Map(
                        "Access-Control-Allow-Origin" -> "*",
                        "Access-Control-Allow-Headers" -> allowHeaders
                        )),
                    body = HttpEntity.Streamed(source, None, Some("application/dash+xml"))
                    ))
              } else {
                Future.successful(NotFound(s"MPD file Not found. ${fileName}"))
              }

          } else { // other mp4 need api token
                  val apiTokenOpt = request.headers.get("Authorization").flatMap(v => v.split("Bearer ").lastOption)
                  apiTokenOpt match {
                    case Some(apiToken) =>
                      val decoded = Jwt.decodeRawAll(apiToken, secret, Seq(JwtAlgorithm.HS256))
                      decoded match {
                        case Success((_, jsonString, _)) =>
                          val json = Json.parse(jsonString)
                          val userId = (json \ "userId").validate[Long].get
                          val expire = (json \ "expire").validate[Long].get


                          if (System.currentTimeMillis() / 1000 <= expire) {
                            val filePath = FileSystems.getDefault.getPath(mpegdashStoreDirPath, fileName)

                            if (Files.exists(filePath)) {
                              Future.successful(
                                RangeResult.ofPath(filePath, request.headers.get("Range"), Some("video/mp4")).withHeaders(
                                  "Access-Control-Allow-Origin" -> "*",
                                  "Access-Control-Allow-Headers" -> allowHeaders
                                )
                              )
                            } else {
                              Future.successful(NotFound(s"MP4 file Not found. ${fileName}"))
                            }
                          } else {
                            Future.successful(BadRequest("Api token expired."))
                          }
                        case _ => Future.successful(BadRequest("Need mpeg dash file name and correct token."))
                      }
                    case _ => Future.successful(BadRequest("Need correct token."))
                  }
      }
  }
  
      def optionsPost = Action.async { implicit request: Request[AnyContent] =>
        Future.successful(Result(
            header = ResponseHeader(200, Map(
                "Access-Control-Allow-Origin" -> "*",
                "Access-Control-Allow-Headers" -> allowHeaders,
                "Access-Control-Allow-Methods" -> "POST, OPTIONS",
                "Access-Control-Allow-Credentials" -> "true",
                "Access-Control-Max-Age" -> "86400"
                )),
            body = HttpEntity.NoEntity
            ))
      }
      def options(fileName: String) = Action.async { implicit request: Request[AnyContent] =>
        Future.successful(Result(
            header = ResponseHeader(200, Map(
                "Access-Control-Allow-Origin" -> "*",
                "Access-Control-Allow-Headers" -> allowHeaders,
                "Access-Control-Allow-Methods" -> "GET, OPTIONS",
                "Access-Control-Allow-Credentials" -> "true",
                "Access-Control-Max-Age" -> "86400"
              )),
            body = HttpEntity.NoEntity
            ))
      }

}
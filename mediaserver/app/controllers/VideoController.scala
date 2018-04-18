package controllers

import java.nio.file.{FileSystems, Files, StandardCopyOption}
import java.util.UUID
import javax.inject._

import play.api.Configuration
import play.api.mvc._
import play.api.libs.json.Json
import play.Logger


import pdi.jwt.{Jwt, JwtAlgorithm}

import scala.util.Success
import scala.concurrent.Future

@Singleton
class VideosController @Inject()(cc: ControllerComponents,
                                 configuration: Configuration) extends AbstractController(cc) {

  val secret = configuration.get[String]("nnDouga.secret")

  val originalStoreDirPath = configuration.get[String]("nnDouga.filesystem.original")

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
                  Future.successful(Ok("File stored."))
                } else {
                  Future.successful(BadRequest("Api token expired."))
                }
              case _ => Future.successful(BadRequest("Need file and api token data."))
            }
        }
      case _ => Future.successful(BadRequest("Need form data."))
    }
  }

}
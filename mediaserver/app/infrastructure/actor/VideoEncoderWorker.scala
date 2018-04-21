package infrastructure.actor

import java.nio.file.{FileSystems, Files}
import java.time.{Clock, LocalDateTime}

import akka.actor.Actor
import domain.entity.{Video, VideoStatus}
import domain.repository.VideoRepository
import play.Logger
import play.api.Configuration

import scala.sys.process.{Process, ProcessLogger}
import scala.concurrent.ExecutionContext.Implicits.global


case class EncodeToH264ACC(video: Video)

case class ExtractAudio(video: Video)

case class Extract720Video(video: Video)

case class Extract360Video(video: Video)

case class EncodeToMpegDash(video: Video)

class VideoEncoderWorker(videoRepository: VideoRepository,
                         configuration: Configuration,
                         clock: Clock
                        ) extends Actor {

  val originalStoreDirPath = configuration.get[String]("nnDouga.filesystem.original")
  val h264accStoreDirPath = configuration.get[String]("nnDouga.filesystem.h264acc")
  val mpegdashStoreDirPath = configuration.get[String]("nnDouga.filesystem.mpegdash")
  val dockerCommand = configuration.get[String]("nnDouga.dockerCommand")

  val processLogger = ProcessLogger(out => {
    Logger.debug(s"${self.path} out : ${out}")
  }, err => {
    Logger.debug(s"${self.path} err : ${err}")
  })

  override def receive = {
    case EncodeToH264ACC(video) => {
      Logger.debug(s"${self.path} : EncodeToH264ACC received! ${video}")
      val startEncodingVideo = video.copy(status = VideoStatus.EncodingToH264ACC, updatedAt = LocalDateTime.now(clock))
      videoRepository.update(startEncodingVideo).failed.foreach { case e => Logger.debug(s"${self.path} DB Store failed. ${e}") }

      val originalFilepath = FileSystems.getDefault.getPath(originalStoreDirPath, video.videoId).toString
      val h264accFilepath = FileSystems.getDefault.getPath(h264accStoreDirPath, video.videoId).toString + ".mp4"

      val args: Seq[String] = Seq(
        dockerCommand, "run", "--rm", "-v", FileSystems.getDefault.getPath(".").toAbsolutePath.toString + ":/tmp/workdir",
        "jrottenberg/ffmpeg:3.3", "-i",
        originalFilepath,
        "-vcodec", "libx264", "-vb", "448k", "-r", "30", "-x264opts", "no-scenecut", "-g", "15", "-acodec", "aac",
        "-strict", "experimental", "-ac", "2", "-ab", "128k", "-frag_duration", "5000000", "-movflags", "empty_moov",
        h264accFilepath)

      val processH264ACC = Process(args)
      Logger.debug(s"start processH264ACC: ${processH264ACC}")
      processH264ACC !< processLogger

      if (Files.exists(FileSystems.getDefault.getPath(h264accFilepath))) {
        val encodedVideo = video.copy(status = VideoStatus.ExtractingAudio, updatedAt = LocalDateTime.now(clock))
        val future = videoRepository.update(encodedVideo)
        future.foreach { case () => self ! ExtractAudio(encodedVideo) }
        future.failed.foreach { case e => Logger.debug(s"${self.path} DB Store failed. ${e}") }
      } else {
        val failedVideo = video.copy(status = VideoStatus.FailedInEncodingToH264ACC, updatedAt = LocalDateTime.now(clock))
        videoRepository.update(failedVideo).failed.foreach { case e => Logger.debug(s"${self.path} DB Store failed. ${e}") }
      }
    }
    case ExtractAudio(video) => {
      Logger.debug(s"${self.path} : ExtractAudio received! ${video}")

      val h264accFilepath = FileSystems.getDefault.getPath(h264accStoreDirPath, video.videoId).toString + ".mp4"
      val mpegdashFilepath = FileSystems.getDefault.getPath(mpegdashStoreDirPath, video.videoId).toString

      // Extract Audio
      val argsExtractAudio: Seq[String] = Seq(
        dockerCommand, "run", "--rm", "-v", FileSystems.getDefault.getPath(".").toAbsolutePath.toString + ":/tmp/workdir",
        "jrottenberg/ffmpeg:3.3", "-i",
        h264accFilepath,
        "-c:a", "copy", "-vn",
        mpegdashFilepath + "-audio.mp4")
      val processExtractAudio = Process(argsExtractAudio)
      Logger.debug(s"start processExtractAudio: ${processExtractAudio}")
      processExtractAudio !< processLogger

      if (Files.exists(FileSystems.getDefault.getPath(mpegdashFilepath + "-audio.mp4"))) {
        val encodedVideo = video.copy(status = VideoStatus.Extracting720Video, updatedAt = LocalDateTime.now(clock))
        val future = videoRepository.update(encodedVideo)
        future.foreach { case () => self ! Extract720Video(encodedVideo) }
        future.failed.foreach { case e => Logger.debug(s"${self.path} DB Store failed. ${e}") }
      } else {
        val failedVideo = video.copy(status = VideoStatus.FailedInExtractingAudio, updatedAt = LocalDateTime.now(clock))
        videoRepository.update(failedVideo).failed.foreach { case e => Logger.debug(s"${self.path} DB Store failed. ${e}") }
      }
    }
    case Extract720Video(video) => {
      Logger.debug(s"${self.path} : Extract720Video received! ${video}")

      val h264accFilepath = FileSystems.getDefault.getPath(h264accStoreDirPath, video.videoId).toString + ".mp4"
      val mpegdashFilepath = FileSystems.getDefault.getPath(mpegdashStoreDirPath, video.videoId).toString

      // Extract 720 video
      val args720Video: Seq[String] = Seq(
        dockerCommand, "run", "--rm", "-v", FileSystems.getDefault.getPath(".").toAbsolutePath.toString + ":/tmp/workdir",
        "jrottenberg/ffmpeg:3.3", "-i",
        h264accFilepath,
        "-an", "-c:v", "libx264", "-x264opts", "keyint=24:min-keyint=24:no-scenecut", "-b:v", "2400k", "-maxrate",
        "2400k", "-bufsize", "1200k", "-vf", "scale=-1:720",
        mpegdashFilepath + "-720.mp4")
      val process720Video = Process(args720Video)
      Logger.debug(s"start args720Video: ${process720Video}")
      process720Video !< processLogger

      if (Files.exists(FileSystems.getDefault.getPath(mpegdashFilepath + "-720.mp4"))) {
        val encodedVideo = video.copy(status = VideoStatus.Extracting360Video, updatedAt = LocalDateTime.now(clock))
        val future = videoRepository.update(encodedVideo)
        future.foreach { case () => self ! Extract360Video(encodedVideo) }
        future.failed.foreach { case e => Logger.debug(s"${self.path} DB Store failed. ${e}") }
      } else {
        val failedVideo = video.copy(status = VideoStatus.FailedInExtracting720Video, updatedAt = LocalDateTime.now(clock))
        videoRepository.update(failedVideo).failed.foreach { case e => Logger.debug(s"${self.path} DB Store failed. ${e}") }
      }
    }
    case Extract360Video(video) => {
      Logger.debug(s"${self.path} : Extract360Video received! ${video}")

      val h264accFilepath = FileSystems.getDefault.getPath(h264accStoreDirPath, video.videoId).toString + ".mp4"
      val mpegdashFilepath = FileSystems.getDefault.getPath(mpegdashStoreDirPath, video.videoId).toString

      // Extract 360 video
      val args360Video: Seq[String] = Seq(
        dockerCommand, "run", "--rm", "-v", FileSystems.getDefault.getPath(".").toAbsolutePath.toString + ":/tmp/workdir",
        "jrottenberg/ffmpeg:3.3", "-i",
        h264accFilepath,
        "-an", "-c:v", "libx264", "-x264opts", "keyint=24:min-keyint=24:no-scenecut", "-b:v", "600k", "-maxrate",
        "600k", "-bufsize", "300k", "-vf", "scale=-1:360",
        mpegdashFilepath + "-360.mp4")
      val process360Video = Process(args360Video)
      Logger.debug(s"start args360Video: ${process360Video}")
      process360Video !< processLogger

      if (Files.exists(FileSystems.getDefault.getPath(mpegdashFilepath + "-360.mp4"))) {
        val encodedVideo = video.copy(status = VideoStatus.EncodingToMpegDash, updatedAt = LocalDateTime.now(clock))
        val future = videoRepository.update(encodedVideo)
        future.foreach { case () => self ! EncodeToMpegDash(encodedVideo) }
        future.failed.foreach { case e => Logger.debug(s"${self.path} DB Store failed. ${e}") }
      } else {
        val failedVideo = video.copy(status = VideoStatus.FailedInExtracting360Video, updatedAt = LocalDateTime.now(clock))
        videoRepository.update(failedVideo).failed.foreach { case e => Logger.debug(s"${self.path} DB Store failed. ${e}") }
      }
    }
    case EncodeToMpegDash(video) => {
      Logger.debug(s"${self.path} : EncodeToH264ACC recieved! ${video}")

      val h264accFilepath = FileSystems.getDefault.getPath(h264accStoreDirPath, video.videoId).toString + ".mp4"
      val mpegdashFilepath = FileSystems.getDefault.getPath(mpegdashStoreDirPath, video.videoId).toString

      // create mpd
      val argsMpd: Seq[String] = Seq(
        dockerCommand, "run", "--rm", "-v", FileSystems.getDefault.getPath(".").toAbsolutePath.toString + ":/work",
        "sambaiz/mp4box", "-dash", "1000", "-rap", "-frag-rap", "-profile", "onDemand", "-out",
        mpegdashFilepath + ".mpd", mpegdashFilepath + "-720.mp4", mpegdashFilepath + "-360.mp4",
        mpegdashFilepath + "-audio.mp4")
      val processMpd = Process(argsMpd)
      Logger.debug(s"start processMpd: ${processMpd}")
      processMpd !< processLogger

      if (Files.exists(FileSystems.getDefault.getPath(mpegdashFilepath + ".mpd"))) {
        Logger.debug(s"Encode Finished!: ${video}")
        val encodedVideo = video.copy(status = VideoStatus.Encoded, updatedAt = LocalDateTime.now(clock))
        val future = videoRepository.update(encodedVideo)
        future.failed.foreach { case e => Logger.debug(s"${self.path} DB Store failed. ${e}") }
      } else {
        val failedVideo = video.copy(status = VideoStatus.FailedInEncodingToMpegDash, updatedAt = LocalDateTime.now(clock))
        videoRepository.update(failedVideo).failed.foreach { case e => Logger.debug(s"${self.path} DB Store failed. ${e}") }
      }
    }
  }
}
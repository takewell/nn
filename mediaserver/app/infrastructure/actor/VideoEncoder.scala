package infrastructure.actor

import java.time.Clock

import akka.actor.{Actor, Props}
import akka.event.Logging
import akka.routing.{ActorRefRoutee, RoundRobinRoutingLogic, Router}
import com.google.inject.Inject
import domain.entity.Video
import domain.repository.VideoRepository
import play.api.Configuration
import play.Logger


case class EncodeStartMessage(video: Video)

class VideoEncoder @Inject()(
                              videoRepository: VideoRepository,
                              configuration: Configuration,
                              clock: Clock
                            ) extends Actor {
  val log = Logging(context.system, this)

  val router = {
    val routees = Vector.fill(4) {
      ActorRefRoutee(context.actorOf(Props(new VideoEncoderWorker(videoRepository, configuration, clock))))
    }
    Router(RoundRobinRoutingLogic(), routees)
  }

  override def receive = {
    case EncodeStartMessage(video) => {
      Logger.debug(s"${self.path} : EncodeStartMessage recieved! ${video}")
      router.route(EncodeToH264ACC(video), self)
    }
  }

}
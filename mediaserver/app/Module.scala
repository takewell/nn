import java.time.Clock

import com.google.inject.AbstractModule
import domain.repository.VideoRepository
import infrastructure.actor.VideoEncoder
import infrastracture.repository.VideoRepositoryImpl
import play.api.libs.concurrent.AkkaGuiceSupport
import play.api.{Configuration, Environment}

class Module(environment: Environment,
             configuration: Configuration) extends AbstractModule  with AkkaGuiceSupport {

  def configure() = {
    bind(classOf[Clock]).toInstance(Clock.systemUTC())
    bind(classOf[VideoRepository]).to(classOf[VideoRepositoryImpl])
    bindActor[VideoEncoder]("video-encoder")
  }
}
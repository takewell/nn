package domain.entity

import play.api.libs.json.{JsString, Writes}

sealed abstract class VideoStatus(val value: String)

object VideoStatus {

  case object OriginalFileSubmitted extends VideoStatus("OriginalFileSubmitted")
  case object EncodingToH264ACC extends VideoStatus("EncodingToH264ACC")
  case object FailedInEncodingToH264ACC extends VideoStatus("FailedInEncodingToH264ACC")
  case object ExtractingAudio extends VideoStatus("ExtractingAudio")
  case object FailedInExtractingAudio extends VideoStatus("ExtractingAudio")
  case object Extracting720Video extends VideoStatus("Extracting720Video")
  case object FailedInExtracting720Video extends VideoStatus("Extracting720Video")
  case object Extracting360Video extends VideoStatus("Extracting360Video")
  case object FailedInExtracting360Video extends VideoStatus("FailedInExtracting360Video")
  case object EncodingToMpegDash extends VideoStatus("EncodingToMpegDash")
  case object FailedInEncodingToMpegDash extends VideoStatus("FailedInEncodingToMpegDash")
  case object Encoded extends VideoStatus("Encoded")
  case object Published extends VideoStatus("Published")
  case object Deleted extends VideoStatus("Deleted")

  def parse(value: String): Option[VideoStatus] =
    value match {
      case OriginalFileSubmitted.value => Some(OriginalFileSubmitted)
      case EncodingToH264ACC.value => Some(EncodingToH264ACC)
      case FailedInEncodingToH264ACC.value => Some(FailedInEncodingToH264ACC)
      case ExtractingAudio.value => Some(ExtractingAudio)
      case FailedInExtractingAudio.value => Some(FailedInExtractingAudio)
      case Extracting720Video.value => Some(Extracting720Video)
      case FailedInExtracting720Video.value => Some(FailedInExtracting720Video)
      case Extracting360Video.value => Some(Extracting360Video)
      case FailedInExtracting360Video.value => Some(FailedInExtracting360Video)
      case EncodingToMpegDash.value => Some(EncodingToMpegDash)
      case FailedInEncodingToMpegDash.value => Some(FailedInEncodingToMpegDash)
      case Encoded.value => Some(Encoded)
      case Published.value => Some(Published)
      case Deleted.value => Some(Deleted)
      case _ => None
    }

  implicit val writes: Writes[VideoStatus] = Writes(s => JsString(s.toString))
}
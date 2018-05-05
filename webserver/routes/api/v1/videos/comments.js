const express = require('express');
const router = express.Router();
const apiTokenDecoder = require('../../../apiTokenDecoder');
const apiTokenEnsurer = require('../../../apiTokenEnsurer');
const config = require('../../../../config');
const Comment = require('../../../../models/comment');
const VideoStatistic = require('../../../../models/videostatistic');

router.post('/:videoId/comments', apiTokenEnsurer, async (req, res, next) => {
  console.log('hogehogehogeohgeohgeo');
  const decoderApiToken = apiTokenDecoder(req);
  if (decoderApiToken) {
    try {
      const content = req.body.content.substring(0, 255);
      const videoPosition = req.body.videoPosition;
      const videoId = req.params.videoId;
      const userId = decoderApiToken.userId;
      const comment = await Comment.create({ content: content, videoPosition: videoPosition, videoId: videoId, userId: userId }).catch(e => console.error(e));
      await VideoStatistic.increment('commentCount', { where: { videoId: videoId } });
      res.json({ status: 'OK', message: 'Comment posted', comment: comment });
    } catch (e) {
      console.error(e);
      res.json({ status: 'NG', message: 'Database error.' });
    }
  } else {
    res.json({ status: 'NG', message: 'Api token not corrent' });
  }
});

module.exports = router;
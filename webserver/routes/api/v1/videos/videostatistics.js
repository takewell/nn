const express = require('express');
const router = express.Router();
const apiTokenDecoder = require('../../../apiTokenDecoder');
const apiTokenEnsurer = require('../../../apiTokenEnsurer');
const config = require('../../../../config');
const VideoStatistic = require('../../../../models/videostatistic');

module.exports = router;

router.get('/:videoId/videostatistics', apiTokenEnsurer, async (req, res, next) => {
  const decodedApiToken = apiTokenDecoder(req);

  if (decodedApiToken) {
    try {
      const videoId = req.params.videoId;

      const result = await VideoStatistic.findOrCreate({
        where: { videoId: videoId },
        defaults: {
          videoId: videoId,
          playCount: 0,
          commentCount: 0,
          myListCount: 0
        }
      });

      console.log('VIDEOSTATISTIC ' + result);
      const videoStatistic = result[0];
      res.json(videoStatistic);
    } catch (e) {
      console.error(e);
      res.json({ status: 'NG', message: 'Database error.' });
    }
  } else {
    res.json({ status: 'NG', message: 'Api token not correct.' });
  }
});

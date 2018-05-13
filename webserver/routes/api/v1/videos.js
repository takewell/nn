const express = require('express');
const router = express.Router();

const apiTokenDecoder = require('../../apiTokenDecoder');
const apiTokenEnsurer = require('../../apiTokenEnsurer');
const config = require('../../../config');
const Video = require('../../../models/video');
const User = require('../../../models/user');
const VideoStatistic = require('../../../models/videostatistic');

module.exports = router;

router.get('/', apiTokenEnsurer, async (req, res, next) => {
  const decodeApiToken = apiTokenDecoder(req);

  if (decodeApiToken) {
    try {
      const videos = await Video.findAll({
        include: [
          { model: User, attributes: ['userId', 'email', 'userName', 'isEmailVerified', 'isAdmin'] },
          { model: VideoStatistic, attributes: ['playCount', 'commentCount', 'myListCount'] }
        ],
        where: { videoStatus: 'Published' },
        order: [['createdAt', 'DESC']],
        limit: 100
      });

      res.json(videos);

    } catch (e) {
      console.error(e);
      res.json({ status: 'NG', message: 'Database error.' });
    }
  } else {
    res.json({ status: 'NG', message: 'API token not correct.' });
  }


});

const express = require('express');
const router = express.Router();
const moment = require('moment');
const apiTokenGenerator = require('../lib/apiTokenGenerator');
const authenticationEnsurer = require('./authenticationEnsurer');
const config = require('../config');
const User = require('../models/user');
const Video = require('../models/video');
const VideoStatistic = require('../models/videostatistic');
const Sequelize = require('../models/sequelizeLoader').Sequelize;

router.get('/:videoId', authenticationEnsurer, async (req, res, next) => {
  const videoId = req.params.videoId;
  let email = '', apiToken = '';
  if (req.user) {
    email = req.user.email;
    apiToken = apiTokenGenerator(req.user.userId, 60 * 60 * 24);
  }

  const include = [{ model: User, attributes: ['userId', 'email', 'userName', 'isEmailVerified', 'isAdmin'] }];
  const where = { videoId: videoId, videoStatus: 'Published' };
  const video = await Video.findOne({ include: include, where: where });

  if (video) {
    await VideoStatistic.increment('playCount', { where: { videoId: videoId } });
    const formattedCreatedAt = moment(video.createdAt).format('YYYY/MM/DD HH:mm');
    res.render('watch', {
      config: config,
      video: video,
      formattedCreatedAt: formattedCreatedAt,
      user: req.user,
      email: email,
      apiToken: apiToken
    });
  } else {
    res.render('notfoundvideo', {
      config: config,
      user: req.user
    });
  }
});

module.exports = router;
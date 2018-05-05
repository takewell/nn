const express = require('express');
const router = express.Router();
const moment = require('moment');
const csrf = require('csurf');
const csrfProtection = csrf({ cookie: true });
const apiTokenGenerator = require('../../lib/apiTokenGenerator');
const authenticationEnsurer = require('../authenticationEnsurer');
const config = require('../../config');
const Video = require('../../models/video');
const VideoStatistic = require('../../models/videostatistic');
const loader = require('../../models/sequelizeLoader');
const Sequelize = loader.Sequelize;
const Op = Sequelize.Op;

router.get('/', authenticationEnsurer, (req, res, next) => {
  let email = '', apiToken = '';
  if (req.user) {
    email = req.user.email;
    apiToken = apiTokenGenerator(req.user.userId, 60 * 60 * 24);
  }

  res.render('my/videos/index', { email: email, apiToken: apiToken, config: config, user: req.user });
});

router.get('/:videoId', authenticationEnsurer, csrfProtection, async (req, res, next) => {
  const videoId = req.params.videoId;
  const video = await Video.findOne({
    where: {
      [Op.or]: [
        { videoId: videoId, videoStatus: 'Published' },
        { videoId: videoId, videoStatus: 'Encoded' }
      ]
    }
  }).catch(e => console.error(e));
  console.log(video);
  if (video && (req.user.isAdmin || video.userId === req.user.userId)) {
    let email = '';
    if (req.user) {
      email = req.user.email;
    }
    const formattedCreatedAt = moment(video.createdAt).format('YYYY/MM/DD HH:mm');
    const formattedUpdatedAt = moment(video.updatedAt).format('YYYY/MM/DD HH:mm');
    res.render('my/videos/edit', {
      email: email,
      config: config,
      video: video,
      formattedCreatedAt: formattedCreatedAt,
      formattedUpdatedAt: formattedUpdatedAt,
      user: req.user,
      csrfToken: req.csrfToken()
    });
  } else {
    res.render('notfoundvideo', {
      config: config,
      user: req.user
    });
  }
});

router.post('/:videoId', authenticationEnsurer, csrfProtection, async (req, res, next) => {
  const videoId = req.params.videoId;
  const title = req.body.title;
  const description = req.body.description;
  console.log(`${videoId}, ${title} , ${description}`);
  const video = await Video.findOne({ where: { videoId: videoId, videoStatus: { [Op.ne]: 'Deleted' } } }).catch(e => console.error(e));
  if (video && (req.user.isAdmin || video.userId === req.user.userId)) {
    let videoStatus = null;
    if (req.body.videoStatus === 'Published') {
      videoStatus = 'Published';
    } else {
      videoStatus = 'Encoded';
    }

    await Video.update({
      title: title.substring(0, 255),
      description: description,
      videoStatus: videoStatus
    }, {
        where: { videoId: video.videoId }
      }).catch(e => console.error(e));

    const array = await VideoStatistic.findOrCreate({
      where: { videoId: videoId },
      defaults: { videoId: videoId, playCount: 0, commentCount: 0, myListCount: 0 }
    });
    console.log(array);
    res.redirect('/my/videos/' + videoId);
  } else {
    res.render('notfoundvideo', {
      config: config,
      user: req.user
    });
  }
});

router.post('/:videoId/delete', authenticationEnsurer, csrfProtection, async (req, res, next) => {
  const videoId = req.params.videoId;
  const video = await Video.findOne({ where: { videoId: videoId, videoStatus: { [Op.ne]: 'Deleted' } } });
  if (video && (req.user.isAdmin || video.userId === req.user.userId)) {
    await Video.update({ videoStatus: 'Deleted' }, { where: { videoId: video.videoId } });
    res.redirect('/my/videos/');
  } else {
    res.render('notfoundvideo', {
      config: config,
      user: req.user
    });
  }
});

module.exports = router;
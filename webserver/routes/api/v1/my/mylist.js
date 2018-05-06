const express = require('express');
const router = express.Router();
const apiTokenDecoder = require('../../../apiTokenDecoder');
const apiTokenEnsurer = require('../../../apiTokenEnsurer');
const config = require('../../../../config');
const Mylistitem = require('../../../../models/mylistitem');
const Video = require('../../../../models/video');
const VideoStatistic = require('../../../../models/videostatistic');
const User = require('../../../../models/user');
const loader = require('../../../../models/sequelizeLoader');
const Sequelize = loader.Sequelize;
const Op = Sequelize.Op;

module.exports = router;

router.get('/', apiTokenEnsurer, async (req, res, next) => {
  const decodedApiToken = apiTokenDecoder(req);

  if (decodedApiToken) {
    try {
      const mylistitem = await Mylistitem.findAll({ where: { userId: decodedApiToken.userId }, order: [['createdAt', 'DESC']] });
      const videoIds = mylistitem.map(i => i.videoId);
      const videos = await Video.findAll({ where: { videoId: { [Op.in]: videoIds } }, order: [['createdAt', 'DESC']] });
      res.json(videos);
    } catch (e) {
      console.error(e);
      res.json({ status: 'NG', message: 'Database error.' });
    }
  } else {
    res.json({ status: 'NG', message: 'Api token not correct.' });
  }
});

router.post('/', apiTokenEnsurer, async (req, res, next) => {
  const decodedApiToken = apiTokenDecoder(req);

  if (decodedApiToken) {
    try {
      const videoId = req.body.videoId;
      const mylistitem = await Mylistitem.create({ videoId: videoId, userId: decodedApiToken.userId });
      await VideoStatistic.increment('myListCount', { where: { videoId: videoId } });
      res.json({ status: 'OK', message: 'Mylistitem created', mylistitem: mylistitem });
    } catch (e) {
      console.error(e);
      res.json({ status: 'NG', message: 'Database error.' });
    }
  } else {
    res.json({ status: 'NG', message: 'Api token not correct.' });
  }

});

router.delete('/', apiTokenEnsurer, async (req, res, next) => {
  const decodedApiToken = apiTokenDecoder(req);
  const videoId = req.body.videoId;

  if (decodedApiToken) {
    try {
      await Mylistitem.destroy({ where: { userId: decodedApiToken.userId, videoId: videoId } });
      const videoStatistic = await VideoStatistic.findById(videoId);
      await videoStatistic.decrement('myListCount', { by: 1 });
      res.json({ statsu: 'OK', message: 'Mylistitem deleted.' });
    } catch (e) {
      console.error(e);
      res.json({ statsu: 'NG', message: 'Datebase error' });
    }
  } else {
    res.json({ statsu: 'NG', message: 'API token not correct.' });
  }
});
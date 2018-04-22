const express = require('express');
const router = express.Router();
const apiTokenDecoder = require('../../../apiTokenDecoder');
const apiTokenEnsurer = require('../../../apiTokenEnsurer');
const config = require('../../../../config');
const Video = require('../../../../models/video');
const User = require('../../../../models/user');
const loader = require('../../../../models/sequelizeLoader');
const Sequelize = loader.Sequelize;
const Op = Sequelize.Op;

router.get('/videos', apiTokenEnsurer, async (req, res, next) => {
  const decodedApiToken = apiTokenDecoder(req);
  if (decodedApiToken) {
    const user = await User.findOne({ where: { userId: decodedApiToken.userId } });
    let whereCondition = { userId: user.userId, videoStatus: { [Op.ne]: 'Deleted' } };
    // 管理者の場合は、削除されていない全動画を表示
    if (user.isAdmin) {
      whereCondition = {
        videoStatus: { [Op.ne]: 'Deleted' }
      };
    }
    const videos = await Video.findAll({ where: whereCondition, order: [['createdAt', 'DESC']] }).catch(e => {
      console.error(e);
      const videos = { status: 'NG', message: 'Database error.' };
    });
    res.json(videos);
  } else {
    res.json({ status: 'NG', message: 'Api token not correct.' });
  }
});

module.exports = router;
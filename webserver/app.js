const express = require('express');
const path = require('path');
const favicon = require('serve-favicon');
const logger = require('morgan');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const helmet = require('helmet');
const session = require('express-session');
const RedisStore = require('connect-redis')(session);
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const config = require('./config');
const strategy = require('./lib/strategy');

// Models
const User = require('./models/user');
const Video = require('./models/video');
const Comment = require('./models/comment');
const Mylistitem = require('./models/mylistitem');
const VideoStatistic = require('./models/videostatistic');

(async () => {
  await User.sync();
  Video.belongsTo(User, { foreignKey: 'userId' });
  Mylistitem.belongsTo(User, { foreignKey: 'userId' });
  await Video.sync();
  Comment.belongsTo(Video, { foreignKey: 'videoId' });
  await VideoStatistic.sync();
  Video.belongsTo(VideoStatistic, { foreignKey: 'videoId' });
  await Comment.sync();
  await Mylistitem.sync();
})();

const index = require('./routes/index');
const login = require('./routes/login');
const logout = require('./routes/logout');
const signup = require('./routes/signup');
const upload = require('./routes/upload');
const watch = require('./routes/watch');
const myVideos = require('./routes/my/videos');
const settings = require('./routes/settings');
// API
const apiV1MyVideos = require('./routes/api/v1/my/videos');
const apiV1VideosComments = require('./routes/api/v1/videos/comments');

const app = express();
app.use(helmet());

passport.use(strategy.getLocalStrategy());

passport.serializeUser(async (user, done) => {
  try {
    const storedUser = await User.findOne({ where: { email: user.email } });
    user.userId = storedUser.userId;
    user.userName = storedUser.username;
    user.isEmailVerified = storedUser.isEmailVerified;
    user.isAdmin = storedUser.isAdmin;
    delete user.password;
    done(null, user);
  } catch (err) { throw err; }
});
passport.deserializeUser((user, done) => done(null, user));

app.use(session({
  store: new RedisStore({
    host: config.REDIS_HOST,
    port: config.REDIS_PORT
  }),
  secret: config.SECRET,
  resave: false,
  saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', index);
app.use('/login', login);
app.use('/logout', logout);
app.use('/signup', signup);
app.use('/upload', upload);
app.use('/watch', watch);
app.use('/settings', settings);
app.use('/my/videos', myVideos);
app.use('/v1/my', apiV1MyVideos);
app.use('/v1/videos', apiV1VideosComments);

app.post(
  '/login',
  passport.authenticate('local', {
    successRedirect: '/',
    failureRedirect: '/login',
    failureFlash: false
  })
);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;

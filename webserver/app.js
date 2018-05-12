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

/**
 * Models
 */
const User = require('./models/user');
const Video = require('./models/video');
const Comment = require('./models/comment');
const Mylistitem = require('./models/mylistitem');
const VideoStatistic = require('./models/videostatistic');

// create databases
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

const app = express();
module.exports = app;

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

/**
 * Routing
 */
const index = require('./routes/index');
app.use('/', index);
const login = require('./routes/login');
app.use('/login', login);
const logout = require('./routes/logout');
app.use('/logout', logout);
const signup = require('./routes/signup');
app.use('/signup', signup);
const upload = require('./routes/upload');
app.use('/upload', upload);
const watch = require('./routes/watch');
app.use('/watch', watch);
const myVideos = require('./routes/my/videos');
app.use('/my/videos', myVideos);
const settings = require('./routes/settings');
app.use('/settings', settings);
const myMylist = require('./routes/my/mylist');
app.use('/my/mylist', myMylist);
// api
const apiV1Videos = require('./routes/api/v1/videos');
app.use('/v1/videos', apiV1Videos);
const apiV1MyVideos = require('./routes/api/v1/my/videos');
app.use('/v1/my', apiV1MyVideos);
const apiV1MyMylist = require('./routes/api/v1/my/mylist');
app.use('/v1/my/mylist', apiV1MyMylist);
const apiV1VideosComments = require('./routes/api/v1/videos/comments');
app.use('/v1/videos', apiV1VideosComments);
const apiV1VideosStatistics = require('./routes/api/v1/videos/videostatistics');
app.use('/v1/videos', apiV1VideosStatistics);

// catch 404 and forward to error handler
app.use((req, res, next) => {
  const err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use((err, req, res, next) => {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

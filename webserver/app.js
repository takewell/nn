var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var helmet = require('helmet');
var session = require('express-session');
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var config = require('./config');

var User = require('./models/user');
var Video = require('./models/video');
var Comment = require('./models/comment');
var Mylistitem = require('./models/mylistitem');
var VideoStatistic = require('./models/videostatistic');

User.sync().then(() => {
  Video.belongsTo(User, { foreignKey: 'userId' });
  Video.sync().then(() => {
    Comment.belongsTo(Video, { foreignKey: 'videoId' });
    Comment.sync();
    Video.belongsTo(VideoStatistic, { foreignKey: 'videoId' });
    VideoStatistic.sync();
  });
  Mylistitem.belongsTo(User, { foreignKey: 'userId' });
  Mylistitem.sync();
});

var index = require('./routes/index');
var login = require('./routes/login');
var logout = require('./routes/logout');
var users = require('./routes/users');

var app = express();
app.use(helmet());

passport.use(
  new LocalStrategy(
    { usernameField: 'email', passwordField: 'password' },
    (email, password, done) => {
      if (email === 'takewell.dev@gmail.com' && password == 'test') {
        done(null, { email, password });
      } else {
        done(null, false, { message: 'パスワードが違います' });
      }
    }
  )
);

passport.serializeUser((user, done) => {
  done(null, user);
});

passport.deserializeUser((user, done) => {
  done(null, user);
});

app.use(
  session({
    secret: config.SECRET,
    resave: false,
    saveUninitialized: false
  })
);

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
app.use('/users', users);

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

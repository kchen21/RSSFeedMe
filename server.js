let express = require('express');
let morgan = require('morgan');
let mongoose = require('mongoose');
let bodyParser = require('body-parser');
let ejs = require('ejs');
let engine = require('ejs-mate');
let session = require('express-session');
let cookieParser = require('cookie-parser');
let flash = require('express-flash');
let MongoStore = require('connect-mongo')(session);
let passport = require('passport');

let User = require('./models/user');
let PersonalCollection = require('./models/personal_collection');
let Bookmark = require('./models/bookmark')

let secret = require('./config/secret');

let mainRoutes = require('./routes/main');
let userRoutes = require('./routes/user');
let adminRoutes = require('./routes/admin');

let app = express();

mongoose.connect(secret.database, (err) => {
  if (err) {
    console.log(err);
  } else {
    console.log("Connected to the database");
  }
});

app.use(express.static(__dirname + '/public'));
app.use(morgan('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(session({
  resave: true,
  saveUninitialized: true,
  secret: secret.secretKey,
  store: new MongoStore({ url: secret.database, autoReconnect: true })
}));
app.use(flash());
app.use(passport.initialize());
app.use(passport.session());
app.use((req, res, next) => {
  if (req.user) {
    res.locals.user = req.user;

    PersonalCollection
      .find({ user: req.user._id })
      .populate({
        path: 'feeds',
        model: 'Feed'
      })
      .exec((err, collections) => {
        if (err) return next(err);
        req.app.locals.collections = collections;
      });

    Bookmark.find({ user: req.user._id }, (err, bookmarks) => {
      if (err) return next(err);

      req.app.locals.bookmarkTitles = [];
      bookmarks.forEach((bookmark) => {
        req.app.locals.bookmarkTitles.push(bookmark.title);
      });
    });
  }

  next();
});

app.engine('ejs', engine);
app.set('view engine', 'ejs');

app.use(mainRoutes);
app.use(userRoutes);
app.use(adminRoutes);

app.listen(secret.port, (err) => {
  if (err) throw err;
  console.log("Server is running on port 3000");
});

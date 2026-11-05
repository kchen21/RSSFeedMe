let express = require('express');
let morgan = require('morgan');
let mongoose = require('mongoose');
let bodyParser = require('body-parser');
let ejs = require('ejs');
let engine = require('ejs-mate');
let session = require('express-session');
let cookieParser = require('cookie-parser');
let flash = require('express-flash');
let MongoStore = require('connect-mongo').default;
let passport = require('passport');

let User = require('./models/user');
let PersonalCollection = require('./models/personal_collection');
let Bookmark = require('./models/bookmark')

let secret = require('./config/secret');

let mainRoutes = require('./routes/main');
let userRoutes = require('./routes/user');
let adminRoutes = require('./routes/admin');

let app = express();

mongoose.connect(secret.database)
  .then(() => console.log("Connected to the database successfully!"))
  .catch((err) => console.error("Database connection error:", err));

app.use(express.static(__dirname + '/public'));
app.use(morgan('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(session({
  resave: true,
  saveUninitialized: true,
  secret: secret.secretKey,
  store: MongoStore.create({ 
    mongoUrl: secret.database,
    dbName: 'rssfeedme'
  })
}));
app.use(flash());
app.use(passport.initialize());
app.use(passport.session());
app.use(async (req, res, next) => {
  if (req.user) {
    res.locals.user = req.user;

    try {
      const collections = await PersonalCollection.find({ user: req.user._id })
        .populate({
          path: 'feeds',
          model: 'Feed'
        });
      
      req.app.locals.collections = collections;

      const bookmarks = await Bookmark.find({ user: req.user._id });

      req.app.locals.bookmarkTitles = [];
      bookmarks.forEach((bookmark) => {
        req.app.locals.bookmarkTitles.push(bookmark.title);
      });

    } catch (err) {
      return next(err);
    }
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
  console.log(`Server is running on port ${secret.port}`);
});

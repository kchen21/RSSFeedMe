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

let secret = require('./config/secret');

let mainRoutes = require('./routes/main');
let userRoutes = require('./routes/user');

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

app.engine('ejs', engine);
app.set('view engine', 'ejs');

app.use(mainRoutes);
app.use(userRoutes);

app.listen(secret.port, (err) => {
  if (err) throw err;
  console.log("Server is running on port 3000");
});

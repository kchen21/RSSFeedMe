let express = require('express');
let morgan = require('morgan');
let mongoose = require('mongoose');
let bodyParser = require('body-parser');
let ejs = require('ejs');
let engine = require('ejs-mate');

let User = require('./models/user');

let secret = require('./config/secret');

let app = express();

mongoose.connect(secret.database, (err) => {
  if (err) {
    console.log(err);
  } else {
    console.log("Connected to the database");
  }
});

app.use(morgan('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.engine('ejs', engine);
app.set('view engine', 'ejs');

app.get('/', (req, res) => {
  res.render('main/today');
});

app.post('/create-user', (req, res, next) => {
  let user = new User();

  user.name = req.body.name;
  user.email = req.body.email;
  user.username = req.body.username;
  user.password_digest = req.body.password;

  user.save((err) => {
    if (err) return next(err);
    res.json("Successfully created a new user");
  });
});

app.listen(secret.port, (err) => {
  if (err) throw err;
  console.log("Server is running on port 3000");
});

let express = require('express');
let morgan = require('morgan');
let mongoose = require('mongoose');

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

app.get('/', (req, res) => {
  res.json("Welcome to RSSFeedMe!");
});

app.listen(secret.port, (err) => {
  if (err) throw err;
  console.log("Server is running on port 3000");
});

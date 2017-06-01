let express = require('express');
let morgan = require('morgan');

let secret = require('./config/secret');

let app = express();

app.use(morgan('dev'));

app.get('/', (req, res) => {
  res.json("Welcome to RSSFeedMe!");
});

app.listen(secret.port, (err) => {
  if (err) throw err;
  console.log("Server is running on port 3000");
});

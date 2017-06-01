let express = require('express');
let morgan = require('morgan');

let app = express();

app.use(morgan('dev'));

app.get('/', (req, res) => {
  res.json("Welcome to RSSFeedMe!");
});

app.listen(3000, (err) => {
  if (err) throw err;
  console.log("Server is running on port 3000");
});

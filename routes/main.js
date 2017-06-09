let router = require('express').Router();
let User = require('../models/user');
let PersonalCollection = require('../models/personal_collection');
let Feed = require('../models/feed');

router.get('/', (req, res) => {
  if (req.user) {
    res.render('main/today', {
      profileMessages: req.flash('profileMessages')
    });
  } else {
    res.redirect('/welcome');
  }
});

router.get('/feeds', (req, res, next) => {
  Feed.find({}, (err, feeds) => {
    res.render('main/feeds', {
      profileMessages: req.flash('profileMessages'),
      feeds: feeds
    });
  });

});

module.exports = router;

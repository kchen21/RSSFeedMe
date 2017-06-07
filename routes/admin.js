let router = require('express').Router();
let Feed = require('../models/feed');

router.get('/add-feed-support', (req, res, next) => {
  res.render('admin/add-feed-support', {
    profileMessages: req.flash('profileMessages'),
    adminMessages: req.flash('adminMessages')
  });
});

router.post('/add-feed-support', (req, res, next) => {
  let feed = new Feed();
  feed.url = req.body.url;
  feed.title = req.body.title;
  feed.description = req.body.description;

  feed.save((err) => {
    if (err) return next(err);
    req.flash('adminMessages', 'Successfully added a feed');
    return res.redirect('/add-feed-support');
  });
});

module.exports = router;

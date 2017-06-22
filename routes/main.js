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

router.post('/collection', (req, res, next) => {
  User.findOne({ _id: req.user._id }, (err, foundUser) => {
    if (err) return next(err);

    let collection = new PersonalCollection();
    collection.title = req.body.title;
    collection.user = foundUser._id;

    collection.save((err) => {
      if (err) return next(err);

      PersonalCollection
        .find({ user: req.user._id })
        .populate({
          path: 'feeds',
          model: 'Feed'
        })
        .exec((err, collections) => {
          if (err) return next(err);
          req.app.locals.collections = collections;
          res.redirect(req.get('referer'));
        });
    });
  });
});

router.post('/subscribe', (req, res, next) => {
  PersonalCollection.findOne({ $and: [{ _id: req.body.collectionId }, { user: req.user._id }] }, (err, collection) => {
    collection.feeds.addToSet(req.body.feedId);

    collection.save((err) => {
      if (err) return next(err);
      return res.redirect('/feeds');
    });
  });
});

module.exports = router;

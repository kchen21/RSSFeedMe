let router = require('express').Router();
let request = require('request');
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

      PersonalCollection
        .find({ user: req.user._id })
        .populate({
          path: 'feeds',
          model: 'Feed'
        })
        .exec((err, collections) => {
          if (err) return next(err);
          req.app.locals.collections = collections;
          res.redirect('/feeds');
        });
    });
  });
});

router.get('/feed/:feed_id', (req, res, next) => {
  Feed.findOne({ _id: req.params.feed_id }, (err, feed) => {
    if (err) return next(err);

    let options = {
      url: "https://query.yahooapis.com/v1/public/yql?q=select%20*%20from%20rss%20where%20url%3D%22" + encodeURIComponent(feed.xml_url) + "%22&format=json&diagnostics=true&callback=",
      method: 'GET'
    };

    request(options, (err, res2, body) => {
      let json = JSON.parse(body);
      res.render('main/feed', {
        profileMessages: req.flash('profileMessages'),
        feed: feed,
        articles: json.query.results.item
      });
    });
  });
});

router.post('/remove-feed-from-collection', (req, res, next) => {
  PersonalCollection.findOne({ $and: [{ _id: req.body.collectionId }, { user: req.user._id }] }, (err, collection) => {
    collection.feeds.pull(req.body.feedId);

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

router.get('/collection/:collection_id', (req, res, next) => {
  PersonalCollection.findOne({ $and: [{ _id: req.params.collection_id }, { user: req.user._id }] }, (err, collection) => {
    if (err) return next(err);

    res.render('main/collection', {
      profileMessages: req.flash('profileMessages'),
      collection: collection
    });
  });
});

router.post('/delete-collection', (req, res, next) => {
  PersonalCollection.remove({ $and: [{ _id: req.body.collectionId }, { user: req.user._id }] }, (err, collection) => {
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
        res.redirect('/');
      });
  });
});

module.exports = router;

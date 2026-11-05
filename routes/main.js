let router = require('express').Router();
let request = require('request');
let async = require('async');
let User = require('../models/user');
let PersonalCollection = require('../models/personal_collection');
let Feed = require('../models/feed');
let RecentArticle = require('../models/recent_article');
let Bookmark = require('../models/bookmark');
const Parser = require('rss-parser');
const parser = new Parser();

router.get('/', (req, res) => {
  if (req.user) {
    res.redirect('/today');
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

router.post('/collection', async (req, res, next) => {
  try {
    const foundUser = await User.findOne({ _id: req.user._id });
    if (!foundUser) return res.status(404).send('User not found');

    let collection = new PersonalCollection();
    collection.title = req.body.title;
    collection.user = foundUser._id;

    await collection.save();

    const collections = await PersonalCollection.find({ user: req.user._id })
      .populate({
        path: 'feeds',
        model: 'Feed'
      });

    req.app.locals.collections = collections;
    res.redirect(req.get('referer'));

  } catch (err) {
    return next(err);
  }
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
          res.redirect(req.get('referer'));
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
  PersonalCollection.findOne({ $and: [{ _id: req.params.collection_id }, { user: req.user._id }] }, (err, collection) =>{
    RecentArticle.find({ feed : { $in : collection.feeds } }, (err, articles) => {
      res.render('main/collection', {
        profileMessages: req.flash('profileMessages'),
        collection: collection,
        articles: articles
      });
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

router.post('/bookmark', async (req, res, next) => {
  try {
    const foundUser = await User.findOne({ _id: req.user._id });
    if (!foundUser) return res.status(404).send('User not found');

    let bookmark = new Bookmark();
    bookmark.link = req.body.link;
    bookmark.image_url = req.body.image_url;
    bookmark.title = req.body.title;
    bookmark.creator = req.body.creator;
    bookmark.pub_date = req.body.pub_date;
    bookmark.description = req.body.description;
    bookmark.user = foundUser._id;

    await bookmark.save();

    req.app.locals.bookmarkTitles.push(bookmark.title);
    res.redirect(req.get('referer'));

  } catch (err) {
    return next(err);
  }
});

router.get('/bookmarks', (req, res, next) => {
  Bookmark.find({}, (err, bookmarks) => {
    res.render('main/bookmarks', {
      profileMessages: req.flash('profileMessages'),
      bookmarks: bookmarks
    });
  });
});

router.post('/delete-bookmark', (req, res, next) => {
  Bookmark.remove({ $and: [{ _id: req.body.bookmarkId }, { user: req.user._id }] }, (err, bookmark) => {
    if (err) return next(err);

    let bookmarkTitleIndex = req.app.locals.bookmarkTitles.indexOf(bookmark.title);

    if (bookmarkTitleIndex > -1) {
      req.app.locals.bookmarkTitles.splice(bookmarkTitleIndex, 1);
    }

    res.redirect('/bookmarks');
  });
});

router.get('/today', async (req, res, next) => {
  if (!req.user) return res.redirect('/welcome');

  try {
    // 1. Clear out previous recent articles
    await RecentArticle.deleteMany({ user: req.user._id });

    // 2. Fetch user collections and populate feeds
    const collections = await PersonalCollection.find({ user: req.user._id })
      .populate({
        path: 'feeds',
        model: 'Feed'
      });

    // 3. Collect unique feeds
    const feedsToFetch = [];
    collections.forEach(collection => {
      if (collection.feeds && collection.feeds.length > 0) {
        collection.feeds.forEach(feed => {
          if (!feedsToFetch.some(f => f._id.toString() === feed._id.toString())) {
            feedsToFetch.push(feed);
          }
        });
      }
    });

    // 4. Download and process feed articles
    for (const feed of feedsToFetch) {
      try {
        const parsedFeed = await parser.parseURL(feed.xml_url);
        
        if (parsedFeed.items && parsedFeed.items.length > 0) {
          for (const item of parsedFeed.items) {
            let recentArticle = new RecentArticle();
            
            recentArticle.link = Array.isArray(item.link) ? item.link[0] : item.link;
            
            if (item.enclosure && item.enclosure.url) {
              recentArticle.image_url = item.enclosure.url;
            } else {
              recentArticle.image_url = "/images/article_icon.jpg";
            }

            recentArticle.title = item.title || "Untitled Article";
            recentArticle.creator = item.creator || item.author || "Unknown";
            recentArticle.pub_date = item.pubDate || item.isoDate;

            if (!item.contentSnippet && !item.content) {
              recentArticle.description = "Click to learn more!";
            } else {
              recentArticle.description = item.contentSnippet || item.content;
            }

            recentArticle.feed = feed._id;
            recentArticle.user = req.user._id;

            await recentArticle.save();
          }
        }
      } catch (feedError) {
        console.error(`Failed to parse feed ${feed.xml_url}:`, feedError.message);
      }
    }

    // 5. Gather newly populated articles to render the page
    const articles = await RecentArticle.find({ user: req.user._id });

    return res.render('main/today', {
      profileMessages: req.flash('profileMessages'),
      articles: articles
    });

  } catch (err) {
    return next(err);
  }
});

router.get('/search', (req, res, next) => {
  Feed.find({ tags: req.query.tag }, (err, feeds) => {
    res.render('main/search', {
      profileMessages: req.flash('profileMessages'),
      tag: req.query.tag,
      feeds: feeds
    });
  });
});

router.post('/search', (req, res, next) => {
  res.redirect('/search?tag=' + req.body.tag);
});

module.exports = router;

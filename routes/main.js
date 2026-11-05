let router = require('express').Router();
let request = require('request');
let async = require('async');
let User = require('../models/user');
let PersonalCollection = require('../models/personal_collection');
let Feed = require('../models/feed');
let RecentArticle = require('../models/recent_article');
let Bookmark = require('../models/bookmark');
const Parser = require('rss-parser');
const parser = new Parser({
  customFields: {
    item: [
      ['media:thumbnail', 'mediaThumbnail'] // Maps <media:thumbnail> XML elements to .mediaThumbnail properties
    ]
  }
});

router.get('/', (req, res) => {
  if (req.user) {
    res.redirect('/today');
  } else {
    res.redirect('/welcome');
  }
});

router.get('/feeds', async (req, res, next) => {
  try {
    const feeds = await Feed.find({});

    return res.render('main/feeds', {
      profileMessages: req.flash('profileMessages'),
      feeds: feeds
    });

  } catch (err) {
    return next(err);
  }
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

router.post('/subscribe', async (req, res, next) => {
  if (!req.user) return res.redirect('/welcome');

  try {
    // Await finding the user's specific collection
    const collection = await PersonalCollection.findOne({ 
      $and: [{ _id: req.body.collectionId }, { user: req.user._id }] 
    });

    // Guard against edge cases where the collection string might be wrong/deleted
    if (!collection) {
      return res.status(404).send('Collection not found');
    }

    // Add the unique feed ID to the schema array set
    collection.feeds.addToSet(req.body.feedId);

    // Await saving the updated collection document
    await collection.save();

    // Await fetching and populating the updated collections global list
    const collections = await PersonalCollection.find({ user: req.user._id })
      .populate({
        path: 'feeds',
        model: 'Feed'
      });

    // Refresh app wide data and redirect the browser back to where it came from
    req.app.locals.collections = collections;
    return res.redirect(req.get('referer'));

  } catch (err) {
    return next(err);
  }
});

router.get('/feed/:feed_id', async (req, res, next) => {
  try {
    // Await finding the specific feed by ID
    const feed = await Feed.findOne({ _id: req.params.feed_id });
    
    if (!feed) {
      return res.status(404).render('error', { message: 'Feed not found' });
    }

    // Use the rss-parser instance to fetch and parse the feed directly from its source URL
    let articles = [];
    try {
      const parsedFeed = await parser.parseURL(feed.xml_url);
      
      // Map properties to match database model schema definitions
      articles = (parsedFeed.items || []).map(item => {
        let imageUrl = "/images/article_icon.jpg"; // Default fallback image

        if (item.mediaThumbnail && item.mediaThumbnail.$ && item.mediaThumbnail.$.url) {
          imageUrl = item.mediaThumbnail.$.url; // Safely extracts the BBC image URL
        } else if (item.enclosure && item.enclosure.url) {
          imageUrl = item.enclosure.url; // Keeps compatibility with standard feeds like NYT
        }

        return {
          title: item.title || "Untitled Article",
          link: item.link,
          pub_date: item.pubDate || item.isoDate,
          creator: item.creator || item.author || "Unknown Author",          
          description: item.contentSnippet || item.content || "Click to learn more!",
          image_url: imageUrl
        };
      });

    } catch (feedError) {
      console.error(`Failed to parse feed ${feed.xml_url}:`, feedError.message);
      req.flash('profileMessages', 'Could not fetch latest articles for this feed.');
    }

    // Render out the feed view template with the newly normalized live articles
    return res.render('main/feed', {
      profileMessages: req.flash('profileMessages'),
      feed: feed,
      articles: articles
    });

  } catch (err) {
    return next(err);
  }
});

router.post('/remove-feed-from-collection', async (req, res, next) => {
  if (!req.user) return res.redirect('/welcome');

  try {
    // Await finding the user's specific collection
    const collection = await PersonalCollection.findOne({ 
      $and: [{ _id: req.body.collectionId }, { user: req.user._id }] 
    });

    // Guard against edge cases where the collection might be wrong or deleted
    if (!collection) {
      return res.status(404).send('Collection not found');
    }

    // Pull the specific feed ID out of the schema array field
    collection.feeds.pull(req.body.feedId);

    // Await saving the updated collection document
    await collection.save();

    // Await fetching and populating the updated collections global list
    const collections = await PersonalCollection.find({ user: req.user._id })
      .populate({
        path: 'feeds',
        model: 'Feed'
      }); // Notice ".exec()" is no longer needed when using await

    // Refresh app-wide data and redirect the browser back to where it came from
    req.app.locals.collections = collections;
    return res.redirect(req.get('referer'));

  } catch (err) {
    return next(err);
  }
});

router.get('/collection/:collection_id', async (req, res, next) => {
  if (!req.user) return res.redirect('/welcome');

  try {
    const collection = await PersonalCollection.findOne({ 
      $and: [{ _id: req.params.collection_id }, { user: req.user._id }] 
    });

    if (!collection) {
      return res.status(404).render('error', { message: 'Collection not found' });
    }

    const articles = await RecentArticle.find({ feed: { $in: collection.feeds } });

    return res.render('main/collection', {
      profileMessages: req.flash('profileMessages'),
      collection: collection,
      articles: articles
    });

  } catch (err) {
    return next(err);
  }
});

router.post('/delete-collection', async (req, res, next) => {
  if (!req.user) return res.redirect('/welcome');

  try {
    // Use deleteOne to remove the single matching document
    await PersonalCollection.deleteOne({ 
      $and: [{ _id: req.body.collectionId }, { user: req.user._id }] 
    });

    // Await fetching and populating the updated collections global list
    const collections = await PersonalCollection.find({ user: req.user._id })
      .populate({
        path: 'feeds',
        model: 'Feed'
      }); // Notice ".exec()" is no longer needed when using await

    // Refresh app-wide data and redirect cleanly to the homepage
    req.app.locals.collections = collections;
    return res.redirect('/');

  } catch (err) {
    return next(err);
  }
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

router.get('/bookmarks', async (req, res, next) => {
  try {
    // Await finding all bookmark documents
    const bookmarks = await Bookmark.find({});

    // Render out the bookmarks view template
    return res.render('main/bookmarks', {
      profileMessages: req.flash('profileMessages'),
      bookmarks: bookmarks
    });

  } catch (err) {
    return next(err);
  }
});

router.post('/delete-bookmark', async (req, res, next) => {
  if (!req.user) return res.redirect('/welcome');

  try {
    // Use findOneAndDelete to find, delete, and return the document in one atomic operation
    const deletedBookmark = await Bookmark.findOneAndDelete({ 
      $and: [{ _id: req.body.bookmarkId }, { user: req.user._id }] 
    });

    // Only attempt to manipulate strings if a matching bookmark was actually found and deleted
    if (deletedBookmark && deletedBookmark.title) {
      let bookmarkTitleIndex = req.app.locals.bookmarkTitles.indexOf(deletedBookmark.title);

      if (bookmarkTitleIndex > -1) {
        req.app.locals.bookmarkTitles.splice(bookmarkTitleIndex, 1);
      }
    }

    // Redirect cleanly back to the overview panel
    return res.redirect('/bookmarks');

  } catch (err) {
    return next(err);
  }
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
            let imageUrl = "/images/article_icon.jpg"; // Default fallback image
            
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

            if (item.mediaThumbnail && item.mediaThumbnail.$ && item.mediaThumbnail.$.url) {
              imageUrl = item.mediaThumbnail.$.url; // Safely extracts the BBC image URL
            } else if (item.enclosure && item.enclosure.url) {
              imageUrl = item.enclosure.url; // Keeps compatibility with standard feeds like NYT
            }
            recentArticle.image_url = imageUrl;

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

router.get('/search', async (req, res, next) => {
  try {
    const feeds = await Feed.find({ tags: req.query.tag });

    return res.render('main/search', {
      profileMessages: req.flash('profileMessages'),
      tag: req.query.tag,
      feeds: feeds
    });

  } catch (err) {
    return next(err);
  }
});

router.post('/search', (req, res, next) => {
  res.redirect('/search?tag=' + req.body.tag);
});

module.exports = router;

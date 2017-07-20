# RSSFeedMe

[RSSFeedMe live][heroku]

[heroku]: https://rssfeedme.herokuapp.com

RSSFeedMe is a full-stack web application that gathers the latest news and information from RSS feeds that its users subscribe to. It utilizes Node.js, Express.js, EJS, MongoDB, and jQuery.

## Features and Implementation

## Online Database

RSSFeedMe uses mLab to store its data. It connects to mLab using `mongoose`, which provides object modeling for Node.js. I used `mongoose` to create the following models: User, Feed, PersonalCollection, Bookmark, and RecentArticle. Session data is stored in the database as well via `session` middleware and `connect-mongo`.

## Auth

User authentication for RSSFeedMe uses the following two libraries: `passport` and `passport-local`.

Users can sign in as a guest or create an account. When creating an new account, a user is required to provide a name, email, username, and password. RSSFeedMe uses `bcrypt` to create a password digest to replace the given password before storing it in the database.

Users can sign in using their username and password. I have configured `passport` to redirect a user back to the welcome page, utilizing `express-flash` to flash an error message, if either the username or password provided is incorrect.

## Feed and PersonalCollection

The administrator (me) can add feeds to RSSFeedMe for users to subscribe to. Each feed that I add must have an XML URL and a title, and can include a description, a link, and an image URL. I chose to make adding feeds private so that (1) I can control which feeds RSSFeeds provides and (2) users do not have to handle searching for and submitting XML URLs themselves. However, I would be more than glad to take suggestions for new RSS feeds to add to RSSFeedMe.

Before subscribing to a feed, a user must create at least one collection, which will be stored as a `PersonalCollection` document. Users can create several collections and add feeds to each of them via the Feeds page, which loads when a user clicks 'Add Feed'. In fact, a user can add a feed to multiple collections.

When a user subscribes to a feed, RSSFeedMe adds its title to the sidebar. Clicking on the title will render the Feed page, which will load that feed's articles. RSSFeedMe fetches article data in real time using a Yahoo! API which organizes feed data from a feed URL and returns it as JSON. Below is the route I created for feed-fetching (Note that I used `request`):

```javascript
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
        feed: feed,
        articles: json.query.results.item
      });
    });
  });
});
```

## Bookmark and RecentArticle

 I created Bookmark and RecentArticle models to store article data. Both belong to a user, require a link, title, and description, and can accept an image URL, creator, and publication date. RecentArticle, however, also belongs to a feed.

 Bookmarks are, in essence, articles that a user can save for later viewing. Since feeds update on a regular basis, an article can disappear from a feed once enough time has passed. To ensure that a user has permanent access to an article he/she has bookmarked, I chose to create a back-up of its data and store it.

 RecentArticle's purpose is to store article data from all the feeds that a user has subscribed to. I created it in order to fetch articles for the Today page, which loads articles from different feeds that a user is subscribed to. The page's `GET` route utilizes `async`'s `waterfall` method to fetch data from each feed before rendering the page itself. Note that the calls are all asynchronous. Thus, not all articles will be present at the time the Today page is rendered. However, we wouldn't want the user to wait forever, until all the articles of all the feeds in his/her collection have been fetched, would we?

 ## To Be implemented

 ### Feed Search

 Users will be able to search for feeds. To implement this, I will be adding tags to feeds, and using Elastic Search to match a user's search terms to tags.

 ### User Avatars

 Users will be able to upload their own avatars. I plan to use AWS S3 to store them.

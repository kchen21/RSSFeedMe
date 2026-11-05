let router = require('express').Router();
let User = require('../models/user');
let PersonalCollection = require('../models/personal_collection');
let Bookmark = require('../models/bookmark');
let passport = require('passport');
let passportConfig = require('../config/passport');

router.get('/welcome', (req, res, next) => {
  res.render('accounts/welcome', {
    signupErrors: req.flash('signupErrors'),
    loginMessages: req.flash('loginMessages')
  });
});

router.post('/signup', async (req, res, next) => {
  try {
    let user = new User();

    user.name = req.body.name;
    user.email = req.body.email;
    user.username = req.body.username;
    user.password_digest = req.body.password;

    const existingUser = await User.findOne({ 
      $or: [{ email: req.body.email }, { username: req.body.username }] 
    });

    if (existingUser) {
      if (existingUser.email === req.body.email) {
        req.flash('signupErrors', "Email is already registered");
      } else if (existingUser.username === req.body.username) {
        req.flash('signupErrors', "Username is already taken");
      }
      return res.redirect('/welcome');
    }

    await user.save();
    return res.redirect('/');

  } catch (err) {
    return next(err);
  }
});

router.post('/login', (req, res, next) => {
  passport.authenticate('local-login', (err, user, info) => {
    if (err) return next(err);
    if (!user) return res.redirect('/welcome');

    PersonalCollection
      .find({ user: user._id })
      .populate({
        path: 'feeds',
        model: 'Feed'
      })
      .exec((err, collections) => {
        if (err) return next(err);
        req.app.locals.collections = collections;
      });

    Bookmark.find({ user: user._id }, (err, bookmarks) => {
      if (err) return next(err);

      req.app.locals.bookmarkTitles = [];
      bookmarks.forEach((bookmark) => {
        req.app.locals.bookmarkTitles.push(bookmark.title);
      });
    });

    req.logIn(user, (err) => {
      if (err) return next(err);
      return res.redirect('/');
    });
  })(req, res, next);
});

router.post('/edit-profile', async (req, res, next) => {
  try {
    const foundUser = await User.findOne({ _id: req.user._id });
    if (!foundUser) return res.status(404).send('User not found');

    if (req.body.name) foundUser.name = req.body.name;
    if (req.body.email) foundUser.email = req.body.email;

    await foundUser.save();
    
    req.flash('profileMessages', 'Successfully updated profile');
    return res.redirect('/');

  } catch (err) {
    return next(err);
  }
});

router.get('/logout', (req, res) => {
  req.logout();
  res.redirect('/welcome');
});

module.exports = router;

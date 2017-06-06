let router = require('express').Router();
let User = require('../models/user');
let passport = require('passport');
let passportConfig = require('../config/passport');

router.get('/welcome', (req, res, next) => {
  res.render('accounts/welcome', {
    signupErrors: req.flash('signupErrors'),
    loginMessage: req.flash('loginMessage')
  });
});

router.post('/signup', (req, res, next) => {
  let user = new User();

  user.name = req.body.name;
  user.email = req.body.email;
  user.username = req.body.username;
  user.password_digest = req.body.password;

  User.findOne({ $or: [{ email: req.body.email }, { username: req.body.username }] }, (err, existingUser) => {

    if (existingUser) {
      if (existingUser.email === req.body.email) {
        req.flash('signupErrors', "Email is already registered");
      } else if (existingUser.username === req.body.username) {
        req.flash('signupErrors', "Username is already taken");
      }
      return res.redirect('/welcome');
    } else {
      user.save((err, user) => {
        if (err) return next(err);
        return res.redirect('/');
      });
    }

  });
});

router.post('/login', passport.authenticate('local-login', {
  successRedirect: '/',
  failureRedirect: '/welcome',
  failureFlash: true
}));

router.get('/profile', (req, res) => {
  res.json(req.user);
});

module.exports = router;

let router = require('express').Router();
let User = require('../models/user');
let passport = require('passport');
let passportConfig = require('../config/passport');

router.get('/welcome', (req, res, next) => {
  res.render('accounts/welcome', {
    signupErrors: req.flash('signupErrors')
  });
});

router.post('/signup', (req, res, next) => {
  let user = new User();

  user.name = req.body.name;
  user.email = req.body.email;
  user.username = req.body.username;
  user.password_digest = req.body.password;

  User.findOne({ email: req.body.email }, (err, existingUser) => {

    if (existingUser) {
      req.flash('signupErrors', "Account with that email address already exists");
      return res.redirect('/welcome');
    } else {
      user.save((err, user) => {
        if (err) return next(err);
        return res.redirect('/');
      });
    }

  });
});

router.get('/login', (req, res) => {
  if (req.user) return res.redirect('/');
  res.render('accounts/welcome', { loginMessage: req.flash('loginMessage') });
});

router.post('/login', passport.authenticate('local-login', {
  successRedirect: '/',
  failureRedirect: '/welcome',
  failureFlash: true
}));

module.exports = router;

let router = require('express').Router();
let User = require('../models/user');

router.post('/signup', (req, res, next) => {
  let user = new User();

  user.name = req.body.name;
  user.email = req.body.email;
  user.username = req.body.username;
  user.password_digest = req.body.password;

  User.findOne({ email: req.body.email }, (err, existingUser) => {

    if (existingUser) {
      console.log("Email " + req.body.email + " already exists");
      return res.redirect('/signup');
    } else {
      user.save((err, user) => {
        if (err) return next(err);
        res.json("New user has been created");
      });
    }

  });
});

module.exports = router;

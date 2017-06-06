let router = require('express').Router();

router.get('/', (req, res) => {
  if (req.user) {
    res.render('main/today');
  } else {
    res.redirect('/welcome');
  }
});

module.exports = router;

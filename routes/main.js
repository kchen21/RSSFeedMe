let router = require('express').Router();

router.get('/', (req, res) => {
  if (req.user) {
    res.render('main/today', {
      successMessage: req.flash('successMessage')
    });
  } else {
    res.redirect('/welcome');
  }
});

module.exports = router;

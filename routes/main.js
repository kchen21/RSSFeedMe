let router = require('express').Router();

router.get('/', (req, res) => {
  res.render('main/today');
});

module.exports = router;
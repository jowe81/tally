var express = require('express');
var router = express.Router();

router.get('/', (req, res) => {
  res.render('index');
})

router.get('/tally', (req, res) => {
  res.render('tally');
});

module.exports = router;
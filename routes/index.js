var express = require('express');
var router = express.Router();

var wechat = require('../util/wechat');

/* GET home page. */
router.get('/', function(req, res) {
  res.render('index', { title: 'Express' });
});

/* GET home page. */
router.get('/wechat', function(req, res) {
  wechat.response(req, res);
});

module.exports = router;

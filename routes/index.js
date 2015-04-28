var express = require('express');
var router = express.Router();

var wechat = require('../util/wechat');
var db = require('../util/database-util');
var getBody = require('raw-body');

/* GET home page. */
router.get('/', function(req, res) {
	res.render('index', { title: 'Express' });
});

router.get('/help', function(req, res) {
	res.render('help', { title: '使用帮助' });
});

router.get('/browse', function(req, res) {
	var data = [];
	db.browseNote(function(err, results) {
		if (err) {
			console.log('[sql error]');
			console.log(err);
			res.render('browse', { title: '浏览通知', data: [], err: err });
			return;
		}
		res.render('browse', { title: '浏览通知', data: results, err: null });
	});
	return;
});

router.get('/mine', function(req, res) {
	var data = [];
	db.browseNoteByUid(req.query.uid, function(err, results) {
		if (err) {
			console.log('[sql error]');
			console.log(err);
			res.render('browse', { title: '我发的通知', data: [], err: err });
			return;
		}
		res.render('browse', { title: '我发的通知', data: results, err: null });
	});
	return;
});

router.get('/view/:id', function(req, res) {
	var data = [];
	db.getNote(req.params.id, function(err, results) {
		if (err || (results.length <= 0)) {
			err = err || {errorMessage: "No record"};
			console.log('[sql error]');
			console.log(err);
			res.render('view', { title: '查看通知', data: {}, err: err });
			return;
		}
		res.render('view', { title: '查看通知', data: results[0], err: null });
	});
	return;
});

router.get('/messages', function(req, res) {
	var data = [];
	db.getMessageBy({}, function(err, results) {
		if (err) {
			console.log('[sql error]');
			console.log(err);
			res.render('browse', { title: '消息记录', data: [], err: err });
			return;
		}
		res.render('browse', { title: '消息记录', data: results, err: null });
	});
	return;
});

router.get('/wechat', function(req, res) {
	wechat.response(req, res);
});

router.post('/wechat', function(req, res) {
	wechat.response(req, res);
});
// {
//      "button":[
//      {	
//           "type":"click",
//           "name":"看通知",
//           "key":"BTN_BROWSE"
//       },
//       {	
//           "type":"click",
//           "name":"发通知",
//           "key":"BTN_POST"
//       }]
//  }

module.exports = router;

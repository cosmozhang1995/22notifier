var express = require('express');
var router = express.Router();
var db = require('../util/database-util.js');

router.get('/', function(req, res) {
  res.render('index', { title: 'Express', data: tableData });
});

router.get('/note/:id', function(req, res) {
	db.getNote(req.params.id, function(err, result) {
		var resObj = {error: null, data: null};
		if (err) {
			resObj.error = err;
			res.status(500);
		}
		else resObj.data = result;
		res.send(JSON.stringify(resObj));
	});
});
router.delete('/note/:id', function(req, res) {
	db.deleteNote(req.params.id, function(err, result) {
		var resObj = {error: null, data: null};
		if (err || result.affectedRows <= 0) {
			resObj.error = err;
			res.status(500);
		}
		else resObj.data = result;
		res.send(JSON.stringify(resObj));
	});
});

module.exports = router;

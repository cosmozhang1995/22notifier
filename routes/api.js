var express = require('express');
var router = express.Router();
var fs = require('fs');
var overlap = require('forest-overlap');
var uuid = require('node-uuid');

router.get('/', function(req, res) {
  res.render('index', { title: 'Express', data: tableData });
});

router.post('/generate', function(req, res) {
	var data = JSON.parse(req.body['data']);
	var dir_abs_path = '/public/output';
	var dir_path = __dirname + '/..' + dir_abs_path;
	if (!(fs.existsSync(dir_path) && fs.statSync(dir_path).isDirectory())) fs.mkdirSync(dir_path);
	var file_abs_path = dir_abs_path + '/' + uuid.v1() + '.xlsx';
	var filepath = __dirname + '/..' + file_abs_path;
	overlap.outputDataSync(filepath, data);
	var real_path = fs.realpathSync(filepath);
	res.download(real_path, '处理结果.xlsx');
});

router.get('/test', function(req,res) {
	var real_path = fs.realpathSync(__dirname + '/../public/output/f46b40d0-688b-11e4-bc7b-4f5b6caeb1c3.xlsx');
	// res.sendfile('/output/f46b40d0-688b-11e4-bc7b-4f5b6caeb1c3.xlsx');
	res.download(real_path);
});

module.exports = router;

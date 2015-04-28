var mysql = require('mysql');
var configs = require('./config');

// User status:
// 0: default
// 1: posting notification
// 2: editing alias

var simpleCallback = function(errMsg, sucMsg) {
	return function(err) {
		if (err) {
			if ((typeof errMsg == "string") && (errMsg != "")) console.error(errMsg);
		} else {
			if ((typeof sucMsg == "string") && (sucMsg != "")) console.log(sucMsg);
		}
	};
};

var getConnection = function() {
	var conn = mysql.createConnection({
		host: configs.db_host,
		port: configs.db_port || 3306,
		user: configs.db_user,
		password: configs.db_pass,
		database: configs.db_name
	});
	// conn.querySync = function(queryStr) {
	// 	var result = null,
	// 		done = false;
	// 	conn.query(queryStr, function(_error, _result) {
	// 		if (!_error) result = _result;
	// 		done = true;
	// 	});
	// 	while (1) if (done) break;
	// 	return result;
	// };
	return conn;
};

var initialize = function() {
	var conn = getConnection();
	conn.query('CREATE TABLE `notify_user` (' +
		'`id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,' +
		'`openid` bigint(20) unsigned NOT NULL UNIQUE,' +
		'`alias` varchar(255) DEFAULT NULL,' +
		'`status` int DEFAULT 0,' +
		'PRIMARY KEY (`id`),' +
		'KEY (`openid`),' +
	') ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8');
	conn.query('CREATE TABLE `notify_item` (' +
		'`id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,' +
		'`user_id` bigint(20) unsigned NOT NULL,' +
		'`content` varchar(65535) NOT NULL,' +
		'`status` int DEFAULT 0,' +
		'`create_time` bigint(20) unsigned NOT NULL DEFAULT 0,' +
		'`exec_time` bigint(20) unsigned NOT NULL DEFAULT 0,' +
		'`deadline_time` bigint(20) unsigned NOT NULL DEFAULT 0,' +
		'PRIMARY KEY (`id`),' +
	') ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8');
	conn.end();
};


// Message actions
var addMessage = function(data) {
	// Data item format:
	// -- msgid
	// -- openid
	// -- type
	// -- content
	// -- timestamp
	function formatSaveString(obj) {
		var _msgid = obj.msgid || 0,
			_openid = obj.openid || "",
			_type = obj.type || "text",
			_content = obj.content || "",
			_timestamp = obj.timestamp || 0;
		if (!_msgid) return null;
		if (_openid == "") return null;
		if (_type == "") return null;
		return '(' + _msgid + ', "' + _openid + '", "' + _type + '", "' + escape(_content) + '", ' + _timestamp + ')'
	}
	// var saveString = '(`msgid`, `openid`, `type`, `content`, `timestamp`) VALUES ';
	var saveString = null;
	if ((data instanceof Array) && (data.length > 0)) {
		var _tmpArr = [];
		for (var _i = 0; _i < data.length; _i++) {
			var _saveStr = formatSaveString(data[_i]);
			if (_saveStr) _tmpArr.push(_saveStr);
		}
		saveString = _tmpArr.join(', ');
	} else if (typeof data === "object") {
		saveString = formatSaveString(data);
	}
	if (saveString) {
		var conn = getConnection();
		conn.query('INSERT INTO `notify_message` (`msgid`, `openid`, `type`, `content`, `timestamp`) VALUES ' + saveString, simpleCallback('add message failed'));
		conn.end();
	}
};
var getMessage = function(where_clause, callback) {
	var conn = getConnection();
	conn.query('SELECT * FROM `notify_message` WHERE ' + where_clause, callback);
	conn.end();
};
var getMessageBy = function(conditions, callback) {
	conditions = conditions || {};
	var whereClauses = [],
		whereClause = "";
	if (conditions['msgid']) whereClauses.push('`msgid` = ' + conditions['msgid']);
	if (conditions['openid']) whereClauses.push('`openid` = "' + conditions['openid'] + '"');
	if (conditions['type']) whereClauses.push('`type` = "' + conditions['type'] + '"');
	if (conditions['time_start']) whereClauses.push('`timestamp` >= "' + conditions['time_start'] + '"');
	if (conditions['time_end']) whereClauses.push('`timestamp` <= "' + conditions['time_end'] + '"');
	if (whereClauses.length > 0) whereClause += whereClauses.join(' AND ');
	else whereClause = "1";
	getMessage(whereClause, function(err, result) {
		if (result.length > 0) {
			for (var i = 0; i < result.length; i++) {
				result[i].content = unescape(result[i].content);
			}
		}
		callback(err,result);
	});
};

// User actions
var addUser = function(openid) {
	var conn = getConnection();
	conn.query('INSERT INTO `notify_user` (`openid`) VALUES ("' + openid + '")', simpleCallback('create user ' + openid + ' failed'));
	conn.end();
};
var deleteUser = function(value, key, callback) {
	var conn = getConnection();
	conn.query('DELETE FROM `notify_user` WHERE `' + (key||'openid') +'`="' + value + '"', callback);
	conn.end();
};
var getUser = function(value, key, callback) {
	var conn = getConnection();
	conn.query('SELECT * FROM `notify_user` WHERE `' + (key||'openid') +'`="' + value + '"', callback);
	conn.end();
};
var setUserName = function(name, condition, callback) {
	var conn = getConnection();
	conn.query('UPDATE `notify_user` SET `alias`="' + name + '" WHERE ' + condition, callback);
	conn.end();
}
var markUserStatus = function(status, condition, callback) {
	var conn = getConnection();
	conn.query('UPDATE `notify_user` SET `status`=' + status + ' WHERE ' + condition, callback);
	conn.end();
};

// Note actions
var addNote = function(content, userid, exec_time, deadline_time, callback) {
	var conn = getConnection();
	var create_time = parseInt(new Date().getTime()/1000);
	exec_time = exec_time || 0;
	deadline_time = deadline_time || 0;
	conn.query('INSERT INTO `notify_item` (`content`, `user_id`, `create_time`, `exec_time`, `deadline_time`) VALUES ("' + content + '", ' + userid + ', ' + create_time + ', ' + exec_time + ', ' + deadline_time + ')', callback);
	conn.end();
};
var browseNote = function(callback) {
	var conn = getConnection();
	var now_time = parseInt(new Date().getTime()/1000);
	var query = 'SELECT notify_item.id as nid, notify_item.content as content, notify_item.create_time as create_time, notify_item.exec_time as time, notify_user.id as uid, notify_user.openid as uopenid, notify_user.alias as username  FROM notify_user,notify_item WHERE notify_item.user_id = notify_user.id and notify_item.exec_time > ' + now_time + ' ORDER BY notify_item.exec_time';
	conn.query(query, callback);
	conn.end();
};
var browseNoteByUid = function(uid, callback) {
	var conn = getConnection();
	var now_time = parseInt(new Date().getTime()/1000);
	var query = 'SELECT notify_item.id as nid, notify_item.content as content, notify_item.create_time as create_time, notify_item.exec_time as time, notify_user.id as uid, notify_user.openid as uopenid, notify_user.alias as username  FROM notify_user,notify_item WHERE notify_item.user_id = notify_user.id and notify_item.exec_time > ' + now_time + ' AND notify_item.user_id = ' + uid + ' ORDER BY notify_item.exec_time';
	conn.query(query, callback);
	conn.end();
};
var getNote = function(id, callback) {
	var conn = getConnection();
	var query = 'SELECT notify_item.id as nid, notify_item.content as content, notify_item.create_time as create_time, notify_item.exec_time as time, notify_user.id as uid, notify_user.openid as uopenid, notify_user.alias as username  FROM notify_user,notify_item WHERE notify_item.user_id = notify_user.id and notify_item.id=' + id;
	conn.query(query, callback);
	conn.end();
};
var deleteNote = function(id, callback) {
	var conn = getConnection();
	conn.query('DELETE FROM `notify_item` WHERE `' + 'id' +'`="' + id + '"', callback);
	conn.end();
};

// Detailed methods
var deleteUserById = function(id,callback) {deleteUser(id,'id',callback);};
var deleteUserByOpenId = function(openid,callback) {deleteUser(openid,'openid',callback);};
var getUserById = function(id,callback) {getUser(id,'id',callback);};
var getUserByOpenId = function(openid,callback) {getUser(openid,'openid',callback);};
var markUserStatusById = function(status,id,callback) {markUserStatus(status,'`id`='+id,callback);};
var markUserStatusByOpenId = function(status,openid,callback) {markUserStatus(status,'`openid`="'+openid+'"',callback);};
var setUserNameById = function(name,id,callback) {setUserName(name,'`id`='+id,callback);};
var setUserNameByOpenId = function(name,openid,callback) {setUserName(name,'`openid`="'+openid+'"',callback);};

module.exports = {
	getConnection: getConnection,
	initialize: initialize,
	addUser: addUser,
	deleteUser: deleteUser,
	getUser: getUser,
	deleteUserById: deleteUserById,
	deleteUserByOpenId: deleteUserByOpenId,
	getUserById: getUserById,
	getUserByOpenId: getUserByOpenId,
	markUserStatusById: markUserStatusById,
	markUserStatusByOpenId: markUserStatusByOpenId,
	setUserNameById: setUserNameById,
	setUserNameByOpenId: setUserNameByOpenId,
	addNote: addNote,
	getNote: getNote,
	browseNote: browseNote,
	browseNoteByUid: browseNoteByUid,
	deleteNote: deleteNote,
	addMessage: addMessage,
	getMessageBy: getMessageBy
};
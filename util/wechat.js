var utils = require('./util');
var db = require('./database-util.js');
var configs = require('./config');

var getDateTime = function(str) {
	var year = new Date().getFullYear(),
		month = NaN,
		date = NaN,
		hour = 23,
		min = 59;
	var splitBySpace = str.split(' ');
	var regDate = /((\d{1,4})[\/\\年]){0,1}(\d{1,2})[\/\\月](\d{1,2})[日号]{0,1}/g,
		regTime = /(\d{1,2})\:(\d{1,2})/g;
	var result = null;
	for (var i = 0; i < 100; i++) {
		result = regDate.exec(str);
		if (result) {
			var y = parseInt(result[2]),
				m = parseInt(result[3]),
				d = parseInt(result[4]);
			if (isNaN(m) || isNaN(d)) continue;
			else {
				if ((1 <= m) && (m <= 12) && (1 <= d) && (d <= 31)) {
					month = m-1;
					date = d;
					if (!isNaN(y)) {
						if ((0 <= y) && (y < 100)) y += 2000;
						if ((2000 <= y) && (y < 3000)) year = y;
					}
				}
			}
		} else {
			break;
		}
	}
	for (var i = 0; i < 100; i++) {
		result = regTime.exec(str);
		if (result) {
			var h = parseInt(result[1]),
				m = parseInt(result[2]);
			if ((0 <= m) && (m < 60) && (0 <= h) && (h < 24)) {
				min = m;
				hour = h;
			}
		} else {
			break;
		}
	}
	if (isNaN(month) || isNaN(date)) return null;
	return new Date(year, month, date, hour, min);
};
var formatDateTime = function(date) {
	var y = date.getFullYear(),
		yearStr = (y == new Date().getFullYear()) ? 0 : (y + '年'),
		str = yearStr + (date.getMonth() + 1) + '月' + date.getDate() + '日',
		h = date.getHours(),
		m = date.getMinutes();
	if ((h == 23) && (m == 59)) return str;
	return str + h + ':' + m;
};
var formNoteList = function(result, hint, user) {
	var articleList = [{
		Title: {$t: utils.cdata(hint)},
		PicUrl: {$t: utils.cdata(configs.site + '/images/banner.jpg')},
		Url: {$t: utils.cdata(configs.site + '/browse'+ '?openid=' + user.openid)}
	}];
	for (var i = 0; i < 8; i++) {
		var item = result[i];
		if (!item) break;
		articleList.push({
			Title: {$t: utils.cdata(formatDateTime(new Date(item.time * 1000)) + '：' + (item.content.substr(0,50)) + ((item.content.length > 50) ? "..." : "") + ((item.username && item.username !== "") ? ('——' + item.username) : ""))},
			// Description: {$t: utils.cdata(item.content.substr(0,50)) + ((item.content.length > 50) ? "..." : "")},
			// Description: null,
			// PicUrl: null,
			Url: {$t: utils.cdata(configs.site + '/view/' + item.nid + '?openid=' + user.openid)}
		});
	}
	// if (result.length > 7) {
	// 	articleList.push({
	// 		Title: {$t: utils.cdata("查看更多")},
	// 		Url: {$t: utils.cdata(configs.site + '/browse'+ '?openid=' + user.openid)}
	// 	});
	// }
	return articleList;
};

var wechat = {
	checkSignature: function(req) {
		var signature = req.query['signature'],
			timestamp = req.query['timestamp'],
			nonce = req.query['nonce'],

			token = configs.token,

			tmpArr = [token, timestamp, nonce];
		tmpArr = tmpArr.sort();
		var tmpStr = tmpArr.join('');
		tmpStr = utils.sha1(tmpStr);

		return (tmpStr === signature);
	},

	response: function(req, res) {
		var isValid = wechat.checkSignature(req);
		if (!isValid) {
			res.status(403).send('Not valid');
			return;
		}
		var echostr = req.query['echostr'];
		if (echostr) {
			res.send(echostr);
			return;
		}

		utils.getBody(req, {
			limit: '100kb',
			length: req.headers['content-length'],
			encoding: 'utf8'
		}, function(err, buf) {
			var msgObj = JSON.parse(utils.xml2json(buf));
			wechat.handleMessage(msgObj, req, res);
		});
	},

	sendText: function(res, text, toUser, fromUser) {
		var time = parseInt(new Date().getTime()/1000);
		var msgObj = {
			xml: {
				ToUserName: {$t:utils.cdata(toUser)},
				FromUserName: {$t:utils.cdata(fromUser)},
				CreateTime: {$t:""+time},
				MsgType: {$t:utils.cdata("text")},
				Content: {$t:utils.cdata(text)}
			}
		};
		var msgTxt = utils.json2xml(msgObj);
		res.send(utils.json2xml(msgObj));
	},

	sendList: function(res, list, toUser, fromUser, user) {
		var time = parseInt(new Date().getTime()/1000);
		var msgObj = {
			xml: {
				ToUserName: {$t:utils.cdata(toUser)},
				FromUserName: {$t:utils.cdata(fromUser)},
				CreateTime: {$t:""+time},
				MsgType: {$t:utils.cdata("news")},
				ArticleCount: {$t:""+list.length},
				Articles: {item: list}
			}
		};
		var msgTxt = utils.json2xml(msgObj);
		console.log(msgTxt);
		res.send(utils.json2xml(msgObj));
	},

	handleSqlError: function(err, msgBody, res) {
		console.error('[sql error]');
		console.log(err);
		wechat.sendText(res, '系统出错', msgBody.FromUserName, msgBody.ToUserName);
	},

	handleMessageFunction: function(msgObj, req, res) {
		var msgBody = msgObj.xml;
		var userOpenId = msgBody.FromUserName;
		if ((msgBody.MsgType == "event") && (msgBody.Event == "subscribe")) {
			db.markUserStatusByOpenId(2, userOpenId, function(err, result) {
				if (err) return wechat.handleSqlError(err, msgBody, res);
				wechat.sendText(res, '欢迎关注集结号！请设置你的名称（直接回复名称即可），好让大家知道你是谁~', msgBody.FromUserName, msgBody.ToUserName);
			});
		} else {
			db.getUserByOpenId(userOpenId, function(err, result) {
				if (err || (result.length == 0)) return wechat.handleSqlError(err || {msg:'User not exist!'}, msgBody, res);
				var user = result[0];
				// Add notice
				if ((msgBody.MsgType == "text") && (user.status == 1)) {
					var content = msgBody.Content,
						date = getDateTime(content),
						timestamp = parseInt((date ? date.getTime() : 0) / 1000);
					db.addNote(content, user.id, timestamp, timestamp, function(err, result) {
						if (err) return wechat.handleSqlError(err, msgBody, res);
						// var echoMsg = '添加成功！' + (date ? '自动识别时间为' + formatDateTime(date) : '没有识别到时间，请输入“我的通知”查看你的通知');
						var echoMsg = (date ? '发布成功！自动识别时间为' + formatDateTime(date) + '。发送“我的通知”查看你发的通知' : '发布失败！因为没有识别到时间。请重新回复“发通知”。');
						db.markUserStatusById(0, user.id);
						wechat.sendText(res, echoMsg, msgBody.FromUserName, msgBody.ToUserName);
						return;
					});
				} else if ((msgBody.MsgType == "text") && (user.status == 2)) {
					var content = msgBody.Content;
					content = content.replace(/\s/g, '');
					if (content == "") {
						wechat.sendText(res, "名称不能为空，请重新设置", msgBody.FromUserName, msgBody.ToUserName);
						return;
					}
					db.setUserNameById(content, user.id, function(err, result) {
						if (err) return wechat.handleSqlError(err, msgBody, res);
						// var echoMsg = '添加成功！' + (date ? '自动识别时间为' + formatDateTime(date) : '没有识别到时间，请输入“我的通知”查看你的通知');
						var echoMsg = "您的名称已被设置为 " + content + "。\n回复“帮助”，可以查看使用帮助，祝愉快~";
						db.markUserStatusById(0, user.id);
						wechat.sendText(res, echoMsg, msgBody.FromUserName, msgBody.ToUserName);
						return;
					});
				} else {
					if ((msgBody.MsgType == "text") && (msgBody.Content == "发通知")) {
						db.markUserStatusById(1, user.id, function(err, result) {
							if (err || (result.affectedRows <= 0)) return wechat.handleSqlError(err || {msg:'User not exist!'}, msgBody, res);
							var echoMsg = "回复通知内容给我即可发送通知。\n\n通知内容中必须包含通知的日期和时间，系统会自动识别。如果需要显式指定日期和时间，将日期时间写在通知最后即可。\n日期参考格式：2015/3/4 或 2015年3月4日 (可不带年份)\n时间参考格式：16:34 (24小时制)\n注意：可以不指定时间，但一定要指定日期！";
							wechat.sendText(res, echoMsg, msgBody.FromUserName, msgBody.ToUserName);
						});
					} else if ((msgBody.MsgType == "text") && (msgBody.Content == "我的通知")) {
						// var echoMsg = '<a href="' + configs.site + '/mine?uid=' + user.id + '&openid=' + user.openid + '">点击这里</a>查看你发的通知';
						// wechat.sendText(res, echoMsg, msgBody.FromUserName, msgBody.ToUserName);
						db.browseNoteByUid(user.id, function(err, result) {
							if (err) return wechat.handleSqlError(err, msgBody, res);
							if (result.length <= 0) return wechat.sendText(res, "没有通知", msgBody.FromUserName, msgBody.ToUserName);
							var articleList = formNoteList(result, "查看我发的通知", user);
							wechat.sendList(res, articleList, msgBody.FromUserName, msgBody.ToUserName);
						});
					} else if ((msgBody.MsgType == "text") && (msgBody.Content == "改名")) {
						db.markUserStatusByOpenId(2, userOpenId, function(err, result) {
							if (err) return wechat.handleSqlError(err, msgBody, res);
							wechat.sendText(res, "回复你要设置的名称", msgBody.FromUserName, msgBody.ToUserName);
						});
					} else if ((msgBody.MsgType == "text") && (msgBody.Content == "帮助")) {
						wechat.sendList(res, [{
							Title: {$t: utils.cdata("使用帮助")},
							PicUrl: {$t: utils.cdata(configs.site + '/images/banner.jpg')},
							Url: {$t: utils.cdata(configs.site + '/help')}
						}], msgBody.FromUserName, msgBody.ToUserName);
					} else  {
						// wechat.sendText(res, '我啥也不知道你打我呀打我呀', msgBody.FromUserName, msgBody.ToUserName);
						db.browseNote(function(err, result) {
							if (err) return wechat.handleSqlError(err, msgBody, res);
							if (result.length <= 0) return wechat.sendText(res, "最近没有通知", msgBody.FromUserName, msgBody.ToUserName);
							var articleList = formNoteList(result, "查看最近到来的通知（若要查看集结号使用帮助，回复“帮助”）", user);
							wechat.sendList(res, articleList, msgBody.FromUserName, msgBody.ToUserName);
						});
					}
				}
			});
		}
	},

	handleMessage: function(msgObj, req, res) {
		// wechat.sendText(res, msgObj.xml.Content, msgObj.xml.FromUserName, msgObj.xml.ToUserName);
		var msgBody = msgObj.xml;
		var userOpenId = msgBody.FromUserName;
		db.getUserByOpenId(userOpenId, function(err, result) {
			if (err) return wechat.handleSqlError(err, msgBody, res);
			if (result.length == 0) {
				db.addUser(userOpenId, function(err, result) {
					if (err) return wechat.handleSqlError(err, msgBody, res);
					wechat.handleMessageFunction(msgObj, req, res);
				});
			} else {
				wechat.handleMessageFunction(msgObj, req, res);
			}
		});
	}
};

module.exports = wechat;
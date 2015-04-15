var configs = {
	token: "weixin",
	appID: "wx704b0b407ae5eac3",
	appsecret: "0ab7da1782ae55b0d400dff6a72a222a"
};

var wechat = {
	checkSignature: function(req) {
		var signature = req.body['signature'],
			timestamp = req.body['timestamp'],
			nonce = req.body['nonce'],

			token = configs.token,

			tmpArr = [token, timestamp, nonce];
		tmpArr = tmpArr.sort();
		var tmpStr = tmpArr.join();

		return (tmpStr === signature);
	},

	response: function(req, res) {
		var isValid = wechat.checkSignature(req);
		if (!isValid) {
			res.status(403).send('Not valid');
			return;
		}
		var echostr = req.body['echostr'];
		if (echostr) {
			res.send(echostr);
			return;
		}
	}
};

module.exports = wechat;
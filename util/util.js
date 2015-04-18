var sha1 = require('./sha1');
var xml2json = require('xml2json');
var getBody = require('raw-body');

module.exports = {
	sha1: sha1.hex_sha1,
	xml2json: xml2json.toJson,
	json2xml: xml2json.toXml,
	getBody: getBody,
	cdata: function(str) {
		return '<![CDATA[' + str + ']]>';
	}
};
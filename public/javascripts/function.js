Number.prototype.toMaxFiexed = function (digits) {
	var ret = this.toFixed(digits);
	ret = ret.replace(/0+$/, '').replace(/\.$/, '');
	return ret;
}

function HTMLEncode (input) { 
	var converter = document.createElement("DIV"); 
	converter.innerText = input; 
	var output = converter.innerHTML; 
	converter = null; 
	return output; 
}

function HTMLDecode (input) { 
	var converter = document.createElement("DIV");
	converter.innerHTML = input;
	var output = converter.innerText;
	converter = null;
	return output;
}

function getQueryParameters () {
	var parameters = {};
	var search = document.location.search;
	search = search.replace(/^\?/, '');
	var arr = search.split('&');
	for (var i = 0; i < arr.length; i++) {
		var split = arr[i].split('=');
		if (split[0] && split[1]) parameters[split[0]] = split[1];
	}
	return parameters;
}

function formatDateTime(date) {
	var y = date.getFullYear(),
		yearStr = (y == new Date().getFullYear()) ? 0 : (y + '年'),
		str = yearStr + (date.getMonth() + 1) + '月' + date.getDate() + '日',
		h = date.getHours(),
		m = date.getMinutes();
	if ((h == 23) && (m == 59)) return str;
	return str + h + ':' + m;
};

function whatWeek(date) {
	var now = new Date(),
		nowYear = now.getFullYear(),
		nowMonth = now.getMonth(),
		nowDate = now.getDate(),
		nowDay = now.getDay(),
		lastWeek = new Date(nowYear, nowMonth, nowDate - nowDay - 6, 0, 0).getTime(),
		thisWeek = new Date(nowYear, nowMonth, nowDate - nowDay + 1, 0, 0).getTime(),
		nextWeek = new Date(nowYear, nowMonth, nowDate - nowDay + 8, 0, 0).getTime(),
		nnxtWeek = new Date(nowYear, nowMonth, nowDate - nowDay + 15, 0, 0).getTime(),
		testTime = date.getTime();
	if (testTime < lastWeek) return 0;  // Not recent
	else if (testTime < thisWeek) return 1;  // Last week
	else if (testTime < nextWeek) return 2;  // This week
	else if (testTime < nnxtWeek) return 3;  // Next week
	else return 4;  // Not recent
};
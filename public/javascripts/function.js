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
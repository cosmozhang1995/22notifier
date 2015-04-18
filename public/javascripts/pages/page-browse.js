var weekdays = ['周日','周一','周二','周三','周四','周五','周六'];
var months = ['一月','二月','三月','四月','五月','六月','七月','八月','九月','十月','十一月','十二月'];

var idx = 0;
var paras = getQueryParameters();

function inflateTable(data) {
	for (var i = 0; i < data.length; i++) {
		var dataItem = data[i];
		var liEl = $('<li nid=' + dataItem.nid + ' class="' + ((paras.openid && paras.openid == dataItem.uopenid) ? "with-delete" : "") + '">' +
			'<a href="javascript:;">' +
				'<div class="time"></div>' +
				'<div class="delete">删除</div>' +
				'<div class="content">' +
					dataItem.content +
				'</div>' +
			'</a>' +
		'</li>').data('notice', dataItem);
		var time = new Date(dataItem.time * 1000);
		var today = new Date();
		var wWeek = whatWeek(time);
		// if ((today.getDate() == time.getDate()) && (today.getMonth() == time.getMonth()) && (today.getYear() == time.getYear())) thisWeek = true;
		if (wWeek == 1) {
			$('<span class="time-weekday-last">' + weekdays[time.getDay()] + '</span>').appendTo(liEl.find('.time'));
			$('<span class="time-month">上周</span>').appendTo(liEl.find('.time'));
		} else if (wWeek == 2) {
			$('<span class="time-weekday-this">' + weekdays[time.getDay()] + '</span>').appendTo(liEl.find('.time'));
			$('<span class="time-month">本周</span>').appendTo(liEl.find('.time'));
		} else if (wWeek == 3) {
			$('<span class="time-weekday-next">' + weekdays[time.getDay()] + '</span>').appendTo(liEl.find('.time'));
			$('<span class="time-month">下周</span>').appendTo(liEl.find('.time'));
		} else {
			$('<span class="time-date">' + time.getDate() + '</span>').appendTo(liEl.find('.time'));
			$('<span class="time-month">' + months[time.getMonth()] + '</span>').appendTo(liEl.find('.time'));
		}
		$('<span class="time-year">' + time.getFullYear() + '</span>').appendTo(liEl.find('.time'));
		liEl.appendTo('.notify-list');
	}
}

function doInflateTable() {
	var tmpArr = [];
	for (var i = 0; i < 10; i++) {
		if (notifyData[i]) tmpArr.push(notifyData[i]);
		else {
			$('.btn-more').hide();
			break;
		}
	}
	inflateTable(tmpArr);
}

function deleteNote(noteid, callback) {
	var confirmed = confirm('确定要删除这条通知吗？');
	if (confirmed) {
		$.ajax({
			url: '/api/note/' + noteid,
			type: 'DELETE',
			dataType: 'json'
		})
		.done(function() {
			alert('删除成功');
			$('.notify-list li[nid=' + noteid + ']').remove();
			callback && callback(true);
		})
		.fail(function() {
			alert('删除失败');
			callback && callback(false);
		})
		.always(function() {
		});
	}
}


$(document).ready(function() {
	$('.notice-viewer-wrapper').detach().appendTo('body');
	$('.btn-more').click(function(event) {
		doInflateTable();
	});
	doInflateTable();
});

$(document)
.on('click', '.notify-list > li', function(event) {
	event.preventDefault();
	var item = $(this).data('notice');
	var time = new Date(item.time * 1000);
	var wWeek = whatWeek(time);
	var urgenClass = (wWeek == 2) ? 'urgen-1' : ((wWeek == 3) ? 'urgen-2' : ((wWeek == 4) ? 'urgen-3' : ''));
	$('.notice-viewer .notice-viewer-time').removeClass('urgen-1 urgen-2 urgen-3').addClass(urgenClass).text(formatDateTime(time));
	$('.notice-viewer .notice-viewer-content').text(item.content);
	if (item.username && item.username != "") $('.notice-viewer .notice-viewer-author').text(item.username).show();
	else $('.notice-viewer .notice-viewer-author').hide();
	if (paras.openid && paras.openid == item.uopenid) $('.notice-viewer .notice-viewer-btn-delete').show();
	else $('.notice-viewer .notice-viewer-btn-delete').hide();
	$('.notice-viewer').data('notice', item);
	$('.notice-viewer-wrapper').show();
})
.on('click', '.notify-list > li .delete', function(event) {
	var nid = $(this).closest('li').data('notice').nid;
	deleteNote(nid);
	return false;
});

$('.notice-viewer-wrapper').click(function(event) {
	$('.notice-viewer-wrapper').hide();
});

$('.notice-viewer .notice-viewer-btn-delete').click(function(event) {
	var nid = $(this).closest('.notice-viewer').data('notice').nid;
	deleteNote(nid, function(result) {
		if (result) $('.notice-viewer-wrapper').hide();
	});
	return false;
});
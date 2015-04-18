var paras = getQueryParameters();

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

$('.notice-viewer .notice-viewer-btn-delete').click(function(event) {
	var nid = notifyData.nid;
	deleteNote(nid, function(result) {
		if (result) window.close();
	});
	return false;
});

$(document).ready(function() {
	var time = new Date(notifyData.time * 1000);
	var wWeek = whatWeek(time);
	var urgenClass = (wWeek == 2) ? 'urgen-1' : ((wWeek == 3) ? 'urgen-2' : ((wWeek == 4) ? 'urgen-3' : ''));
	$('.notice-viewer .notice-viewer-time').removeClass('urgen-1 urgen-2 urgen-3').addClass(urgenClass).text(formatDateTime(time));
	$('.notice-viewer .notice-viewer-content').text(notifyData.content);
	if (notifyData.username && notifyData.username != "") $('.notice-viewer .notice-viewer-author').text(notifyData.username).show();
	else $('.notice-viewer .notice-viewer-author').hide();
	if (paras.openid && paras.openid == notifyData.uopenid) $('.notice-viewer .notice-viewer-btn-delete').show();
	else $('.notice-viewer .notice-viewer-btn-delete').hide();
	$('.notice-viewer').data('notice', notifyData);
});
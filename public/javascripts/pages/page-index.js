$(document).ready(function() {
	$('#file').change(function(event) {
		// $('#form').submit();
		var filename = this.value.split(/[\/\\]/);
		filename = filename[filename.length - 1];
		$('.btn-file-choose').text(filename);
	});

	var dropbox = document.getElementById('file-dropbox');

	// dropbox.addEventListener("dragenter", function(e){  
	// 	dropbox.style.borderColor = '#666';
	// }, false);
	// dropbox.addEventListener("dragleave", function(e){  
	// 	dropbox.style.borderColor = '#ccc';
	// }, false);
	// dropbox.addEventListener("dragenter", function(e){
	// 	e.stopPropagation();
	// 	e.preventDefault();
	// }, false);
	// dropbox.addEventListener("dragover", function(e){
	// 	e.stopPropagation();
	// 	e.preventDefault();
	// }, false);
	// dropbox.addEventListener("drop", function(e){
	// 	e.stopPropagation();
	// 	e.preventDefault();
	// 	dropbox.style.borderColor = '#ccc';
	// 	handleFiles(e.dataTransfer.files);  
	// }, false);
	
	$('.btn-file-choose').on('click', function(event) {
		event.preventDefault();
		$('#file').click();
	});

	$('.btn-limittype-select').on('click', function(event) {
		event.preventDefault();
		$('#limit_type').val($(this).data('value'));
		$('#limit_type').attr('value', $(this).data('value'));
		$('.btn-limittype-select').removeClass('btn-warning');
		$(this).addClass('btn-warning');
	});

	$($('.btn-limittype-select').get(0)).click();

	// $('.btn-check').click(function(event) {
	// 	var inputEl = $(this).data('field');
	// 	if (typeof inputEl === "string") inputEl = $('input[name=' + inputEl + ']');
	// 	else return;
	// 	var texts = $(this).data('text');
	// 	if (typeof texts === "string") texts = texts.split('|');
	// 	else return;
	// 	var curr_val = inputEl.attr('value') || inputEl.val();
	// 	if ((curr_val === true) || (curr_val === "true")) {
	// 		console.log('true');
	// 		inputEl.val(false).attr('value', false);
	// 		$(this).removeClass('btn-danger');
	// 		$(this).html(texts[1] + '<span class="btn-check-hint">（点击后 ' + texts[0] + '）</span>');
	// 	} else {
	// 		console.log('false');
	// 		inputEl.val(true).attr('value', true);
	// 		$(this).addClass('btn-danger');
	// 		$(this).html(texts[0] + '<span class="btn-check-hint">（点击后 ' + texts[1] + '）</span>');
	// 	}
	// });

	// $('.btn-check').each(function(index, el) {
	// 	var texts = $(this).data('text');
	// 	if (typeof texts === "string") texts = texts.split('|');
	// 	var inputEl = $(this).data('field');
	// 	if (typeof inputEl === "string") inputEl = $('input[name=' + inputEl + ']');
	// 	var curr_val = inputEl.attr('value') || inputEl.val();
	// 	if ((curr_val === true) || (curr_val === "true")) $(this).html(texts[0] + '<span class="btn-check-hint">（点击后 ' + texts[1] + '）</span>');
	// 	else $(this).html(texts[1] + '<span class="btn-check-hint">（点击后 ' + texts[0] + '）</span>');
	// });
});

function handleFiles(files) {
	console.log(files);
	myf = files;
}
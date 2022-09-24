function changeTitle(inputTitle) {
	// 메타 태그 변경
	inputTitle += " / 통계마당 Statistical Ground"
	document.title = inputTitle
	$("meta[property='og\\:title']").attr("content", inputTitle);
}
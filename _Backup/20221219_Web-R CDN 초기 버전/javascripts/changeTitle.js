function changeTitle(inputTitle) {
	// 메타 태그 변경
	inputTitle += " / Web-R"
	document.title = inputTitle
	$("meta[property='og\\:title']").attr("content", inputTitle);
}
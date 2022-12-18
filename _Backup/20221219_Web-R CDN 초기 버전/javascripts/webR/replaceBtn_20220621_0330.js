function replaceBtn(idName, colorTag, connectURL)
{
	$("#" + idName).html("")
	
	html = '<button class="' + colorTag + '" onclick="window.open(\'/webR/connection/' + connectURL + '\', \'_blank\')">'
	html += '<span style="color:white">접속하기</span>'
	html += '</button>'
	$("#" + idName).html(html)		
}
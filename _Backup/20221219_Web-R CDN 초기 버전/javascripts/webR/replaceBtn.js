function replaceBtn(idName, colorTag, connectURL)
{
	$("#" + idName).html("")
	
	html = '<button class="' + colorTag + '" onclick="location.href=\'/webR/connection/' + connectURL + '\'">'
	html += '<span style="color:white">접속하기</span>'
	html += '</button>'
	$("#" + idName).html(html)		
}
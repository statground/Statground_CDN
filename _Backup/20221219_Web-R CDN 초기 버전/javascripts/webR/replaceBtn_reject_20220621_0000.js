function replaceBtn_reject(idName, colorTag, msg)
{
	$("#" + idName).html("")
	
	html = '<button class="' + colorTag + '" disabled>'
	html += '<span style="color:white">' + msg + '</span>'
	html += '</button>'
	$("#" + idName).html(html)		
}
function replaceBtn(idName, colorTag, iconTag, msg)
{
	$("#" + idName).html("")
	
	html = '<button class="' + colorTag + '">'
	html += '<span style="color:white">'
	html += '<i class="' + iconTag + '"></i>&nbsp;&nbsp;' + msg
	html += '</span>'
	html += '</button>'
	$("#" + idName).html(html)		
}

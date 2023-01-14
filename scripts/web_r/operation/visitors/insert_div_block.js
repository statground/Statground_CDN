function insert_div_block(title, content)
{
	html = '<div class="col-md-3">'
	html += '<div class="shadow rounded bg-white p-2 mt-2">'
	html += '<div class="d-block d-sm-flex align-items-center">'
	html += '<div class="mt-3 mt-sm-0 ms-0 ms-sm-3">'
	html += '<h4 class="h5 mb-1">' + title + '</h4>'
	html += '<p class="mb-0">' + content + '</p>'
	html += '</div>'
	html += '</div>'
	html += '</div>'
	html += '</div>'
	return html
}
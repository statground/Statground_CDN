// Container - Header
function html_container_header(title="", msg="")
{
	html = '<div class="container">'
	html += '<div class="row justify-content-center">'
	html += '<div class="col-lg-12">'
	html += '<center>'
	html += '<div style="padding: 35px;">'
	html += '<h5 class="mb-4 text-primary font-secondary">' + title + '</h5>'
	html += '<p>' + msg + '</p>'
	html += '</div>'
	html += '</center>'
	html += '</div>'
	html += '</div>'
	html += '</div>'
	
	return html
}


// Button
function html_button(color="primary", msg = "", onclick=null, disabled=false)
{
	html = '<button type="button" class="btn btn-' + color + '" '
	if (onclick != null) { html += 'onclick="' + onclick + '" '; }
	if (disabled) { html += 'disabled="disabled" ' }
	html += '>'
	html += msg
	html += '</button>'
	return html
}


// Card
function html_card(title="", msg="")
{
	html = '<div class="card">'
	html += '<div class="card-header" style="color:black;">' + title + '</div>'
	html += '<div class="card-body">' + msg + '</div>'
	html += '</div>'
	
	return html
}


// P
function html_p(msg="", color="black")
{
	html = '<p style="color:' + color + '">' + msg + '</p>'
	return html
}
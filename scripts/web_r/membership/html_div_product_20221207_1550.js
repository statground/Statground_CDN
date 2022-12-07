function html_div_product(name="정회원", msg="", msg2="", price=100000, div_id=1, product_id="", email="")
{
	html = '<div class="col-lg-4 col-md-6 pt-1">'
	html += '<div class="shadow rounded bg-white p-4 mt-4">'
	html += '<center>'
	html += '<h4>정회원</h4><br/>'
	html += msg
	html += '<p style="color:black;"><b>￦' + numberWithCommas(price) + ' / 1년</b></p>'
	html += '</center>'
	html += msg2

	html += '<br/>'

	html += '<center>'
	html += '<div id="div_buttons_upgrade_' + div_id.toString() + '">'
	html += '<button type="button" class="btn btn-primary" onclick="btn_payment_show(' + div_id.toString() + ')">업그레이드</button>'
	html += '</div>'
	html += '<div id="div_buttons_payment_' + div_id.toString() + '" style="display:none;">'
	html += html_button(color="warning", msg="카드 결제",
						onclick='request_order_id(\'' + product_id + '\', \'card\', \'' + email + '\'')
	html += html_button(color="warning", msg="가상계좌",
						onclick='request_order_id(\'' + product_id + '\', \'va\', \'' + email + '\'')
	html += '<br/>'
	html += html_button(color="warning", msg="계좌이체",
						onclick='request_order_id(\'' + product_id + '\', \'account\', \'' + email + '\'')
	//html += html_button(color="warning", msg="정기구독", disabled=true)
	html += '</div>'
	html += '</center>'
	html += '</div>'
	html += '</div>'

	return html
}
function payment_init_html(email, username, phone)
{
	product_id = "70568900-7384-11ed-a1eb-0242ac120002"
	result_url_id = "380926ec-8483-11ed-a1eb-0242ac120002"

	$("#div_loader").hide()

	// 이용자 정보가 GET 방식으로 넘어오지 않을 시, failed를 출력한다.
	if ( email == "None" || username == "None" || phone == "None" ) {
		$("#div_failed").show()

	} else {
		$("#div_infomation").show()

		// 수강자 정보
		html = '<p id="email" class="card-text" style="color:black; font-size:small;"><b>E-mail:</b> ' + email + '</p>'
		html += '<p id="username" class="card-text" style="color:black; font-size:small;"><b>이름:</b> ' + username + '</p>'
		html += '<p id="phone" class="card-text" style="color:black; font-size:small;"><b>연락처:</b> ' + phone + '</p>'
		html += "<br/>"
		$("#div_userInfo").html(html)

		// 결제용 버튼
		html = html_button(color="warning", msg="카드 결제",
						   onclick='request_order_id(\'' + product_id + '\', \'' + result_url_id + '\', \'card\', \'' + email + '\', \'' + username + '\', \'' + phone + '\')')
		html += "&nbsp;"
		html += html_button(color="warning", msg="가상계좌",
							onclick='request_order_id(\'' + product_id + '\', \'' + result_url_id + '\', \'va\', \'' + email + '\', \'' + username + '\', \'' + phone + '\')')
		html += "&nbsp;"
		html += html_button(color="warning", msg="계좌이체",
							onclick='request_order_id(\'' + product_id + '\', \'' + result_url_id + '\', \'account\', \'' + email + '\', \'' + username + '\', \'' + phone + '\')')
		$("#div_buttons").html(html)
	}
}
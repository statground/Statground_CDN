function check_web_r_user()
{
	// 버튼 - 돌아가기
	function btn_back()
	{
		html = '&nbsp;&nbsp;'
		html += html_button(color="info", msg="돌아가기", onclick="location.href=\'/\'")
		
		return html
	}

	function btn_origin()
	{
		$("#div_buttons").html("")

		html = html_button(color="warning", msg="입력 확인", onclick="check_web_r_user()")
		html += btn_back()

		$("#div_buttons").html(html)
	}

	// 버튼 - 입력 정보 확인중
	function btn_loading()
	{
		$("#div_buttons").html("")

		btn_msg = '<img src="https://cdn.jsdelivr.net/gh/statground/Statground_CDN/assets/images/loading-buffering.gif" width="25px"/>'
		btn_msg += '&nbsp;&nbsp;'
		btn_msg += '입력 정보 확인중'

		html = html_button(color="warning", msg=btn_msg, disabled=true)
		html += btn_back()

		$("#div_buttons").html(html)
	}

	// 버튼 - 다음 단계로
	function btn_next(email)
	{
		$("#div_buttons").html("")

		html = html_button(color="success", msg="다음 단계로", onclick='location.href=\'/membership/application?email=' + email + '\'')
		html += btn_back()

		$("#div_buttons").html(html)
	}


	btn_loading()
	$("#div_result").html("")
	$("#alert_email").hide();   $("#alert_success").hide();   $("#alert_failed").hide()

	
	email = $("#email").val()

	$.ajax({
		url : "/membership/ajax_check_web_r_account/?email=" + email,
		success:function(data){
			// 이용자 정보가 있을 경우
			if (data.user_name != null && data.user_name != "wrong_email") {
				html = "<p style='color:black;'>Web-R 가입자 정보</p>"
				html += "<p style='font-size:small;'>이름: " + data.user_name + "</p>"
				html += "<p style='font-size:small;'>닉네임: " + data.nick_name + "</p>"
				html += "<p style='font-size:small;'>가입 일자:" + data.regdate + "</p>"
				$("#div_result").html(html)
				
				btn_next(email)
				$("#alert_success").show()

			// 이메일 주소가 잘못되었을 경우
			} else if (data.user_name != null && data.user_name == "wrong_email") {
				btn_origin()
				$("#alert_email").show()
			
			// 이메일 주소가 잘못되었을 경우
			} else {
				btn_origin()
				$("#alert_failed").show()
			}
		}
	})
}
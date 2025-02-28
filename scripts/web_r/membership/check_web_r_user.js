function check_web_r_user()
{
	// 버튼 - 돌아가기
	function btn_back()
	{
		html = '&nbsp;&nbsp;'
		html += '<button type="button" class="btn btn-info" onclick="location.href=\'/\'">'
		html += '돌아가기'
		html += '</button>'
		
		return html
	}

	function btn_origin()
	{
		$("#div_buttons").html("")

		html = '<button type="button" class="btn btn-warning" onclick="check_web_r_user()">'
		html += '다시 입력 확인'
		html += '</button>'
		html += btn_back()

		$("#div_buttons").html(html)
	}

	// 버튼 - 입력 정보 확인중
	function btn_loading()
	{
		$("#div_buttons").html("")

		html = '<button type="button" class="btn btn-warning" disabled>'
		html += '<img src="https://cdn.jsdelivr.net/gh/statground/Statground_CDN/assets/images/loading-buffering.gif" width="25px"/>'
		html += '&nbsp;&nbsp;'
		html += '입력 정보 확인중'
		html += '</button>'
		html += btn_back()

		$("#div_buttons").html(html)
	}

	// 버튼 - 다음 단계로
	function btn_next(email)
	{
		$("#div_buttons").html("")

		html = '<button type="button" class="btn btn-success" onclick="location.href=\'/membership/application/?email=' + email + '\'">'
		html += '다음 단계로'
		html += '</button>'
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
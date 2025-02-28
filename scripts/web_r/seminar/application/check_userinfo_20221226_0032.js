function check_userinfo()
{
	// 버튼 - 돌아가기
	function btn_back()
	{
		html = '&nbsp;&nbsp;'
		html += html_button(color="info", msg="돌아가기", onclick="location.href=\'/seminar\'")
		return html
	}

	// 버튼 - 입력 확인
	function btn_origin()
	{
		$("#div_buttons").html("")

		html = html_button(color="warning", msg="입력 확인", onclick="check_userinfo()")
		html += btn_back()

		$("#div_buttons").html(html)
	}

	// 버튼 - 입력 정보 확인중
	function btn_loading()
	{
		$("#div_buttons").html("")
		$("#div_alert").html("")        // 알림 메시지 초기화

		btn_msg = '<img src="https://cdn.jsdelivr.net/gh/statground/Statground_CDN/assets/images/loading-buffering.gif" width="25px"/>'
		btn_msg += '&nbsp;&nbsp;'
		btn_msg += '입력 정보 확인중'

		html = html_button(color="warning", msg=btn_msg, onclick=null, disabled=true)
		html += btn_back()

		$("#div_buttons").html(html)
	}

	// 버튼 - 수강신청 완료
	function btn_complete()
	{
		$("#div_buttons").html("")
		
		html = html_button(color="success", msg="수강 신청 완료", onclick=null, disabled=true)
		html += btn_back()

		$("#div_buttons").html(html)
	}

	// 버튼 - 다음 단계로
	function btn_next(email, username, phone)
	{
		$("#div_buttons").html("")

		html = html_button(color="success", msg="다음 단계로",
						   onclick="location.href=\'/seminar/application/payment/?email=" + email + "&username=" + username + "&phone=" + phone + "\'")
		html += btn_back()

		$("#div_buttons").html(html)
	}


	btn_loading()       // 입력 정보를 확인하기에 앞서 로딩 버튼

	var email = $("#email").val()
	var username = $("#username").val()
	var phone = $("#phone").val()

	$.ajax({
		url : "/seminar/ajax_check_userinfo_form/?email=" + email + "&username=" + username + "&phone=" + phone,
		success:function(data){
			// 입력 form 확인
			if (data.email == null) { $("#div_alert").append(html_p("이메일이 입력되지 않았거나 형식이 잘못되었습니다.", "red")) }
			if (data.username == null) { $("#div_alert").append(html_p("이름이 입력되지 않았습니다.", "red")) }
			if (data.phone == null) { $("#div_alert").append(html_p("연락처가 입력되지 않았거나 형식이 잘못되었습니다.", "red")) }

			/***** 모든 입력이 올바르게 입력된 것이 확인되었을 경우 *****/
			if (data.email != null && data.username != null && data.phone != null)
			{
				/*** 수강신청 이력이 있는 신청자 ***/
				if (data.log != null && "status" in data.log) {
					$("#div_alert").append(html_p("이미 수강 신청이 완료된 신청자입니다.", "blue"))

					/* 수강신청이 완료된 신청자 */
					if (data.log.status == "DONE") {
						btn_complete()      // 수강 신청 완료

					/* 수강신청이 완료되지 않은 신청자 */
					} else {
						$("#div_alert").append(html_p("모든 정보가 올바르게 입력되었습니다. 다음 단계를 진행할 수 있습니다.", "blue"))
						btn_next(data.email, data.username, data.phone)      // 버튼 - 다음 단계로
					}
					
				/*** 처음 신청하는 신청자 ***/
				} else {
					$("#div_alert").append(html_p("모든 정보가 올바르게 입력되었습니다. 다음 단계를 진행할 수 있습니다.", "blue"))
					btn_next(data.email, data.username, data.phone)      // 버튼 - 다음 단계로
				}

			} else {
				btn_origin()        // 입력 정보가 잘못되었다면, "입력 정보 확인" 버튼으로 돌아간다.
			}

		}, error : function(error) {
			btn_origin()        // 입력 정보가 잘못되었다면, "입력 정보 확인" 버튼으로 돌아간다.
		},
	})
}
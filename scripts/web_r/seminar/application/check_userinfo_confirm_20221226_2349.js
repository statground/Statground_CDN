function check_userinfo_confirm()
{
	function hide_alerts()
	{
		$("#alert_email").hide();    $("#alert_name").hide();     $("#alert_phone").hide()
		$("#alert_success").hide();  $("#alert_exist").hide();    $("#alert_notexist").hide();		$("#alert_waiting").hide()
	}

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

		html = html_button(color="warning", msg="입력 확인", onclick="check_userinfo_confirm()")
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

		html = html_button(color="warning", msg=btn_msg, disabled=true)
		html += btn_back()

		$("#div_buttons").html(html)
	}


	hide_alerts()       // alert 메시지 모두 감추기
	btn_loading()       // 입력 정보를 확인하기에 앞서 로딩 버튼
	
	var email = $("#email").val()
	var username = $("#username").val()
	var phone = $("#phone").val()

	$.ajax({
		url : "/seminar/ajax_check_userinfo_form/?email=" + email + "&username=" + username + "&phone=" + phone,
		success:function(data){
			if (data.email == null) { $("#div_alert").append(html_p("이메일이 입력되지 않았거나 형식이 잘못되었습니다.", "red")) }
			if (data.username == null) { $("#div_alert").append(html_p("이름이 입력되지 않았습니다.", "red")) }
			if (data.phone == null) { $("#div_alert").append(html_p("연락처가 입력되지 않았거나 형식이 잘못되었습니다.", "red")) }

			/***** 모든 입력이 올바르게 입력된 것이 확인되었을 경우 *****/
			if (data.email != null && data.username != null && data.phone != null)
			{
				/*** 이미 수강신청이 완료된 신청자 ***/
				if (data.log.status == "DONE") {
					$("#div_alert").append(html_p("이미 수강 신청이 완료된 신청자입니다.", "blue"))
					
				/*** 결제 대기중인 신청자 ***/
				} else if (data.log.status == "WAITING_FOR_DEPOSIT") {
					$("#div_alert").append(html_p("결제 대기중인 신청자입니다.", "blue"))
					$("#div_alert").append(html_p("은행: " + data.log.result.virtualAccount.bank, "black"))
					$("#div_alert").append(html_p("계좌 번호: " + data.log.result.virtualAccount.accountNumber, "black"))
					$("#div_alert").append(html_p("금액: " + data.log.result.balanceAmount, "black"))
					$("#div_alert").append(html_p("만료 시각: " + data.log.result.virtualAccount.dueDate.replace('T', ' '), "black"))

				/*** 처음 신청하는 신청자 ***/
				} else {
					$("#div_alert").append(html_p("수강자 명단에 없습니다.", "blue"))
				}
			}

			btn_origin()        // "입력 정보 확인" 버튼으로 돌아간다.

		}, error : function(error) {
			btn_origin()        // "입력 정보 확인" 버튼으로 돌아간다.
		},
	})
}
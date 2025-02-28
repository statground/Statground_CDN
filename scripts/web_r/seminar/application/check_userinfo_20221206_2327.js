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

		btn_msg = '<img src="https://cdn.jsdelivr.net/gh/statground/Statground_CDN/assets/images/loading-buffering.gif" width="25px"/>'
		btn_msg += '&nbsp;&nbsp;'
		btn_msg += '입력 정보 확인중'

		html = html_button(color="warning", msg=btn_msg, disabled=true)
		html += btn_back()

		$("#div_buttons").html(html)
	}

	// 버튼 - 수강신청 완료
	function btn_complete()
	{
		$("#div_buttons").html("")
		
		html = html_button(color="success", msg="수강 신청 완료", disabled=true)
		html += btn_back()

		$("#div_buttons").html(html)
	}

	// 버튼 - 다음 단계로
	function btn_next(orderID)
	{
		$("#div_buttons").html("")

		html = html_button(color="success", msg="다음 단계로", onclick='location.href=\'/seminar/application/payment/' + orderID + '\'')
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
			if (data.email != null) { $("#alert_email").hide() } else { $("#alert_email").show() }
			if (data.username != null) { $("#alert_name").hide() } else { $("#alert_name").show() }
			if (data.phone != null) { $("#alert_phone").hide() } else { $("#alert_phone").show() }

			/***** 모든 입력이 올바르게 입력된 것이 확인되었을 경우 *****/
			if (data.email != null && data.username != null && data.phone != null)
			{
				/*** 이미 수강신청이 완료된 신청자 ***/
				if (data.exist == 1) {
					$("#alert_exist").show() 
					btn_complete()      // 수강 신청 완료
					
				/*** 처음 신청하는 신청자 ***/
				} else {
					$("#alert_success").show() 
					btn_next(data.orderID)      // 버튼 - 다음 단계로
				}

			} else {
				btn_origin()        // 입력 정보가 잘못되었다면, "입력 정보 확인" 버튼으로 돌아간다.
			}

		}, error : function(error) {
			btn_origin()        // 입력 정보가 잘못되었다면, "입력 정보 확인" 버튼으로 돌아간다.
		},
	})
}
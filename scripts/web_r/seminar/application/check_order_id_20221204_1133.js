function check_order_id(orderID)
{
	$.ajax({
		url : "/seminar/ajax_check_order_id/?orderID=" + orderID,
		success:function(data){
			$("#div_loader").hide()

			if ( !Object.keys(data).includes('email') || !Object.keys(data).includes('username') || !Object.keys(data).includes('phone') ) {
				$("#div_failed").show()

			} else {
				$("#div_infomation").show()

				// 수강자 정보
				html = "<br/>"
				html += '<p id="email" class="card-text" style="color:black; font-size:small;"><b>E-mail:</b> ' + data.email + '</p>'
				html += '<p id="username" class="card-text" style="color:black; font-size:small;"><b>이름:</b> ' + data.username + '</p>'
				html += '<p id="phone" class="card-text" style="color:black; font-size:small;"><b>연락처:</b> ' + data.phone +'</p>'
				html += "<br/>"
				$("#div_userInfo").html(html)


				// 이미 수강신청이 완료된 이용자
				if ("result" in data && "message" in data.result){
					html = '<p>' + data.result.message + '</p>'

				} else {
					// 결제용 버튼
					html = '<button type="button" class="btn btn-primary"'
					html += 'onclick="func_billing_card(\'' + data.toss_payment_key + '\', \'' + orderID + '\', \'' + data.username + '\', \'' + data.successURL + '\', \'' + data.failedURL + '\');">'
					html += '카드 결제</button>&nbsp;'
	
					html += '<button type="button" class="btn btn-primary"'
					html += 'onclick="func_billing_va(\'' + data.toss_payment_key + '\', \'' + orderID + '\', \'' + data.username + '\', \'' + data.successURL + '\', \'' + data.failedURL + '\');">'
					html += '가상계좌 입금</button>&nbsp;'
	
					html += '<button type="button" class="btn btn-primary"'
					html += 'onclick="func_billing_account(\'' + data.toss_payment_key + '\', \'' + orderID + '\', \'' + data.username + '\', \'' + data.successURL + '\', \'' + data.failedURL + '\');">'
					html += '계좌 이체</button>&nbsp;'
				}


				$("#div_buttons").html(html)
			}

		}, error : function(error) {
			$("#div_failed").show()
		},
	})
}
function result_order_id(paymentKey, orderID)
{
	$.ajax({
		url : "/ajax_finish_order_id/?paymentKey=" + paymentKey + "&orderID=" + orderID,
		success:function(data){
			$("#div_loader").hide()

			$("#div_infomation").show()

			// 수강자 정보
			html = '<p id="email" class="card-text" style="color:black; font-size:small;"><b>E-mail:</b> ' + data.email + '</p>'
			html += '<p id="username" class="card-text" style="color:black; font-size:small;"><b>이름:</b> ' + data.username + '</p>'
			html += '<p id="phone" class="card-text" style="color:black; font-size:small;"><b>연락처:</b> ' + data.phone +'</p>'
			html += "<br/>"
			$("#div_userInfo").html(html)


			// 이미 수강신청이 완료된 이용자
			if ("result" in data && "message" in data.result){
				$("#container_header").html(html_container_header("결제 실패(3/3)", "수강 신청이 실패하였습니다."))
				html = '<p>' + data.result.message + '</p>'
			
			// 가상 계좌 - 결제 대기
			} else if (data.status == "WAITING_FOR_DEPOSIT") {
				$("#container_header").html(html_container_header("결제 대기(3/3)", "결제를 완료하면, 수강 신청이 완료됩니다."))
				html = '<p>주문 번호: ' + data.order_id + '</p>'
				html += '<p style="font-size:small; color:black;">은행: ' + data.result.virtualAccount.bank + '</p>'
				html += '<p style="font-size:small; color:black;">계좌번호: ' + data.result.virtualAccount.accountNumber + '</p>'
				html += '<p style="font-size:small; color:black;">만료 시각: ' + data.result.virtualAccount.dueDate.replace('T', ' ') + '</p>'

			// 결제 완료
			} else {
				$("#container_header").html(html_container_header("결제 성공(3/3)", "수강 신청이 완료되었습니다."))
				html = '<p>주문 번호: ' + data.order_id + '</p>'
			}

			$("#div_buttons").html(html)

		}, error : function(error) {
			$("#div_failed").show()
		},
	})
}
async function result_order_id(paymentKey, orderID, amount)
{
	const data = await fetch("/ajax_finish_order_id/?paymentKey=" + paymentKey + "&orderID=" + orderID)
					.then(res=> { return res.json(); })
					.then(res=> { return res; });

	ReactDOM.render(<Div_btn_result />, document.getElementById("btn_bottom"))

	// 결제 실패
	if ("result" in data.log && "message" in data.log.result){
		data['log_status'] = "FAILED"
		data['txt_header'] = "등록 실패"
		
	// 가상 계좌 - 결제 대기
	} else if (data.log.result.status == "WAITING_FOR_DEPOSIT") {
		data['log_status'] = "WAITING"
		data['txt_header'] = "결제 대기"
		
	// 결제 완료
	} else {
		data['log_status'] = "SUCCESS"
		data['txt_header'] = "등록 성공"
	}
	data['amount'] = amount

	ReactDOM.render(<Div_finish_order data={data} />, document.getElementById("div_result_text"))
}
async function check_registered_user() {
	let class_msg_result_success = "mt-2 text-sm text-red-600"
	let class_msg_result_failed = "mt-2 text-sm text-red-600"

	// 버튼 클릭 시 메시지
	function Div_msg_result(props) {
		return(
			<span class="font-medium">{props.text}</span>
		)
	}

	// 텍스트에 입력한 값
	let txt_email = document.getElementById("txt_email").value.trim()
	let txt_phone = document.getElementById("txt_phone").value.trim()
	let txt_name = document.getElementById("txt_name").value.trim()

	// 정규식
	let regex_email = new RegExp('[a-z0-9]+@[a-z]+\.[a-z]{2,3}');
	let regex_phone = new RegExp(/^[0-9]+$/);

	ReactDOM.render(<Div_btn_submit_loading />, document.getElementById("div_button"))


	// 이메일을 입력하지 않은 경우
	if (txt_email == null || txt_email == "") {
		document.getElementById("msg_result").className = class_msg_result_failed
		ReactDOM.render(<Div_msg_result text="이메일을 입력해주세요." />, document.getElementById("msg_result"))
		ReactDOM.render(<Div_btn_submit_default />, document.getElementById("div_button"))
		document.getElementById("txt_email").focus()

	// 이메일 형식이 올바르지 않은 경우
	} else if (!txt_email.match(regex_email)) {
		document.getElementById("msg_result").className = class_msg_result_failed
		ReactDOM.render(<Div_msg_result text="이메일 형식이 올바르지 않습니다." />, document.getElementById("msg_result"))
		ReactDOM.render(<Div_btn_submit_default />, document.getElementById("div_button"))
		document.getElementById("txt_email").focus()

	// 전화번호를 입력하지 않은 경우
	} else if (txt_phone == null || txt_phone == "") {
		document.getElementById("msg_result").className = class_msg_result_failed
		ReactDOM.render(<Div_msg_result text="연락처를 입력해주세요." />, document.getElementById("msg_result"))
		ReactDOM.render(<Div_btn_submit_default />, document.getElementById("div_button"))
		document.getElementById("txt_phone").focus()

	// 전화번호에 숫자가 아닌 값이 있는 경우
	} else if (!txt_phone.match(regex_phone)) {
		document.getElementById("msg_result").className = class_msg_result_failed
		ReactDOM.render(<Div_msg_result text="연락처에는 숫자만 입력해 주세요." />, document.getElementById("msg_result"))
		ReactDOM.render(<Div_btn_submit_default />, document.getElementById("div_button"))
		document.getElementById("txt_phone").focus()

	// 이름을 입력하지 않은 경우
	} else if (txt_name == null || txt_name == "") {
		document.getElementById("msg_result").className = class_msg_result_failed
		ReactDOM.render(<Div_msg_result text="이름을 입력해주세요." />, document.getElementById("msg_result"))
		ReactDOM.render(<Div_btn_submit_default />, document.getElementById("div_button"))
		document.getElementById("txt_name").focus()

	} else {
		// 계정명은 영어, 숫자만 입력 가능
		const request_data = new FormData();
		request_data.append('txt_email', txt_email);
		request_data.append('txt_phone', txt_phone);
		request_data.append('txt_name', txt_name);

		const data = await fetch("/checker/ajax_check_registered_user/", {
									method: "post", 
									headers: { "X-CSRFToken": getCookie("csrftoken"), },
									body: request_data
									})
							.then(res=> { return res.json(); })
							.then(res=> { return res; });

		if (data.checker == "SUCCESS") {
			// 결제 실패
			if ("log" in data && "result" in data.log && "message" in data.log.result){
				data['log_status'] = "FAILED"
				data['txt_header'] = "등록 실패"
				
			// 가상 계좌 - 결제 대기
			} else if ("log" in data && "result" in data.log && data.log.result.status == "WAITING_FOR_DEPOSIT") {
				data['log_status'] = "WAITING"
				data['txt_header'] = "결제 대기"
				
			// 결제 완료
			} else {
				data['log_status'] = "SUCCESS"
				data['txt_header'] = "등록 성공"
			}

			document.getElementById("div_result_text").className = "pt-4 mx-auto w-full"
			ReactDOM.render(<Div_finish_order data={data} />, document.getElementById("div_result_text"))
		}
		ReactDOM.render(<Div_btn_submit_default />, document.getElementById("div_button"))
	}

	setTimeout(function() { 
		document.getElementById("msg_result").className = "hidden"
	}, 3000);
}
async function click_login() {
	ReactDOM.render(<Div_btn_login_spinner />, document.getElementById("div_btn_submit"))

	if (toggle_btn_login == 1) {
		toggle_btn_login = 0

		const data_request = new FormData();
		data_request.append('txt_email', document.getElementById("txt_email").value);
		data_request.append('txt_password', document.getElementById("txt_password").value);

		let data = await fetch("/ajax_click_login/", {  method: "post", 
														headers: {"X-CSRFToken": getCookie("csrftoken")},
														body: data_request
													 })
						.then(res=> { return res.json(); })
						.then(res=> { return res; });

		// 로그인 성공
		if (data.checker == "DONE") {
			location.href="/main/"

		// 비밀번호 틀림
		} else if (data.checker == "WRONGPASSWORD") {
			alert ("비밀번호가 틀렸습니다.");

		// 그 외 로그인 실패
		} else {
			alert ("계정 정보가 잘못되었습니다.")
			
		}


		toggle_btn_login = 1
	}

	ReactDOM.render(<Div_btn_login />, document.getElementById("div_btn_submit"))
}
function check_password_form() {
	// 텍스트박스에 입력한 값 (비밀번호)
	let password = document.getElementById("txt_password").value.trim()

	// 값이 입력되지 않음
	if (password == "" || password == null) {
		document.getElementById("desc_password_msg").className = class_desc_msg
		ReactDOM.render(<Div_desc_err_msg class={class_msg} text="비밀번호를 입력해주세요." />, document.getElementById("desc_password_msg"))

		return false

	// 비밀번호 길이가 8자 이하임
	} else if (password.length < 8) {
		document.getElementById("desc_password_msg").className = class_desc_msg
		ReactDOM.render(<Div_desc_err_msg class={class_msg} text="비밀번호를 8자 이상 입력해주세요." />, document.getElementById("desc_password_msg"))

		return false

	// 이메일 형식 체크 성공
	} else {
		document.getElementById("desc_password_msg").className = "hidden"
		ReactDOM.render(<Div_desc_err_msg class="hidden" text="" />, document.getElementById("desc_password_msg"))

		return true
	}
}
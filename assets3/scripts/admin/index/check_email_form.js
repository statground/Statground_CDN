// 이메일 형식 확인
function check_email_form() {
	// 텍스트박스에 입력한 값 (이메일)
	let email = document.getElementById("txt_email").value.trim()

	// 이메일 체크 정규식
	let regExp = /^[0-9a-zA-Z]([-_\.]?[0-9a-zA-Z])*@[0-9a-zA-Z]([-_\.]?[0-9a-zA-Z])*\.[a-zA-Z]{2,3}$/i

	// 값이 입력되지 않음
	if (email == "" || email == null) {
		document.getElementById("desc_email_msg").className = class_desc_msg
		ReactDOM.render(<Div_desc_err_msg class={class_msg} text="이메일을 입력해주세요." />, document.getElementById("desc_email_msg"))

		return false

	// 이메일 형식 체크 실패
	} else if (!regExp.test(email)) {
		document.getElementById("desc_email_msg").className = class_desc_msg
		ReactDOM.render(<Div_desc_err_msg class={class_msg} text="형식이 올바르지 않습니다." />, document.getElementById("desc_email_msg"))

		return false

	// 이메일 형식 체크 성공
	} else {
		document.getElementById("desc_email_msg").className = "hidden"
		ReactDOM.render(<Div_desc_err_msg class="hidden" text="" />, document.getElementById("desc_email_msg"))

		return true
	}
}
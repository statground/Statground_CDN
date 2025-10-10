function check_login_form() {
	// 로그인 시도 가능
	if (check_email_form() && check_password_form()) {
		toggle_btn_login = 1
		document.getElementById("btn_submit").className = class_btn_enabled
		
	// 로그인 시도 불가
	} else {
		toggle_btn_login = 0
		document.getElementById("btn_submit").className = class_btn_disabled
	}
}

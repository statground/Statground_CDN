function check_login_form() {
	if (check_email_form() && check_password_form()) {
		document.getElementById("btn_submit").className = class_btn_enabled
		
	} else {
		document.getElementById("btn_submit").className = class_btn_disabled
	}
}
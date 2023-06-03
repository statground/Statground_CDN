// 세션 선택
function click_session(days) {
	if (days == "1") {
		if (btn_days_1 == 1) {
			btn_days_1 = 0
		} else {
			btn_days_1 = 1
		}

	} else {
		if (btn_days_2 == 1) {
			btn_days_2 = 0
		} else {
			btn_days_2 = 1
		}
	}

	reset_product_info()
}

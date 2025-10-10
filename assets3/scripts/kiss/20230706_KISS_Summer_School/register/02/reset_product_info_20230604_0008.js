// 강의 선택 여부에 따라 product_id 변경
function reset_product_info() {
	// 1일차, 2일차, 학생 아님
	if (btn_days_1 == 1 && btn_days_2 == 1 && chk_student == 0) { 
		product_id = "861511be-fa37-11ed-be56-0242ac120002"
		price_days_1 = 120000
		price_days_2 = 120000

	// 1일차, 2일차, 학생
	} else if (btn_days_1 == 1 && btn_days_2 == 1 && chk_student == 1) { 
		product_id = "8615140c-fa37-11ed-be56-0242ac120002"
		price_days_1 = 80000
		price_days_2 = 80000

	} else if (btn_days_1 == 1 && btn_days_2 == 0 && chk_student == 0) { 
		product_id = "8615140c-fa37-11ed-be56-0242ac120002"
		price_days_1 = 120000
		price_days_2 = 0

	} else if (btn_days_1 == 1 && btn_days_2 == 0 && chk_student == 1) { 
		product_id = "8615140c-fa37-11ed-be56-0242ac120002"
		price_days_1 = 80000
		price_days_2 = 0

	} else if (btn_days_1 == 0 && btn_days_2 == 1 && chk_student == 0) { 
		product_id = "8615140c-fa37-11ed-be56-0242ac120002"
		price_days_1 = 0
		price_days_2 = 120000

	} else if (btn_days_1 == 0 && btn_days_2 == 1 && chk_student == 1) { 
		product_id = "8615140c-fa37-11ed-be56-0242ac120002"
		price_days_1 = 0
		price_days_2 = 80000

	} else {
		product_id = ""
		price_days_1 = 0
		price_days_2 = 0

	}

	ReactDOM.render(<Div_li_payment_btn />, document.getElementById("li_payment_btn"))
}
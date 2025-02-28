// 학생 여부 선택
function click_chk_student(){
	if (chk_student == 0) {
		chk_student = 1
		document.getElementById("div_file").className = "flex flex-col items-center pl-4 w-full rounded pr-4 mx-auto"
	} else {
		chk_student = 0
		document.getElementById("div_file").className = "hidden"
	}
	
	reset_product_info()
}
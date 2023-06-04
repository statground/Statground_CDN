function check_file_upload() {
	var formData = new FormData();
	
	formData.append('file_input', $('#id_file_input')[0].files[0]);
	formData.append('email', email);
	formData.append('name', name);
	formData.append('phone', phone);

	$.ajax({
		type: "POST",
		enctype: 'multipart/form-data',
		url: "/register/ajax_file_upload/",
		data: formData,
		processData: false,
		contentType: false,
		cache: false,
		timeout: 600000,
		success: function (data) {
			alert("파일이 업로드 되었습니다.");
			ReactDOM.render(<Div_li_payment_btn />, document.getElementById("li_payment_btn"))
		},
		error: function (e) {
			alert("파일 업로드에 실패하였습니다.");
		}
	});
}
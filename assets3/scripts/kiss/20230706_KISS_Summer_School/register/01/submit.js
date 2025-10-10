function submit() {
	document.getElementById("email").value = document.getElementById("txt_email").value.trim();
	document.getElementById("phone").value = document.getElementById("txt_phone").value.trim();
	document.getElementById("name").value = document.getElementById("txt_name").value.trim();

	document.getElementById('form_register_01').submit();
}
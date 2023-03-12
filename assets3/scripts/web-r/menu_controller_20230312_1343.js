let toggle_seminar = 0
let toggle_favoriates = 0

function menu_controller(type) {
	function menu_hide(){
		document.getElementById('mega_menu_seminar').style.display='none';
		document.getElementById('mega_menu_favoriates').style.display='none';
	}

	// 워크샵, 세미나
	if (type == "seminar") {
		if (toggle_seminar == 0) {
			toggle_seminar = 1
			document.getElementById('mega_menu_seminar').style.display='block';
			document.getElementById('mega_menu_favoriates').style.display='none';
		} else {
			toggle_seminar = 0
			menu_hide()
		}

	// 공식 홈페이지
	} else if (type == "favoriates") {
		if (toggle_favoriates == 0) {
			toggle_favoriates = 1
			document.getElementById('mega_menu_seminar').style.display='none';
			document.getElementById('mega_menu_favoriates').style.display='block';
		} else {
			toggle_favoriates = 0
			menu_hide()
		}
	}
}
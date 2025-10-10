let menu_toggle_seminar = 0
let menu_toggle_favoriates = 0

function menu_controller(type) {
	function menu_hide(){
		document.getElementById('mega_menu_seminar').style.display='none';
		document.getElementById('mega_menu_favoriates').style.display='none';
	}

	// 워크샵, 세미나
	if (type == "seminar") {
		if (menu_toggle_seminar == 0) {
			menu_toggle_seminar = 1
			document.getElementById('mega_menu_seminar').style.display='block';
			document.getElementById('mega_menu_favoriates').style.display='none';
		} else {
			menu_toggle_seminar = 0
			menu_hide()
		}

	// 공식 홈페이지
	} else if (type == "favoriates") {
		if (menu_toggle_favoriates == 0) {
			menu_toggle_favoriates = 1
			document.getElementById('mega_menu_seminar').style.display='none';
			document.getElementById('mega_menu_favoriates').style.display='block';
		} else {
			menu_toggle_favoriates = 0
			menu_hide()
		}
	}
}
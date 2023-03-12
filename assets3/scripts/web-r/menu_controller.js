let toggle_seminar = 0
let toggle_favoriates = 0

function menu_controller(type) {
	function menu_hide(){
		document.getElementById('mega-menu-full-dropdown').style.display='none';
		document.getElementById('mega-menu-full-image-dropdown').style.display='none';
	}

	// 워크샵, 세미나
	if (type == "seminar") {
		if (toggle_seminar == 0) {
			document.getElementById('mega-menu-full-dropdown').style.display='none';
			document.getElementById('mega-menu-full-image-dropdown').style.display='block';
			toggle_seminar = 1
		} else {
			menu_hide()
			toggle_seminar = 0
		}

	// 공식 홈페이지
	} else if (type == "favoriates") {
		if (toggle_favoriates == 0) {
			document.getElementById('mega-menu-full-dropdown').style.display='block';
			document.getElementById('mega-menu-full-image-dropdown').style.display='none';
			toggle_favoriates = 1
		} else {
			menu_hide()
			toggle_favoriates = 0
		}
	}
}
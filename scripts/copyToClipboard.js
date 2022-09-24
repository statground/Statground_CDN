function copyToClipboard(val) {
	const t = document.createElement("textarea");
	document.body.appendChild(t);
	t.value = val;
	t.select();
	document.execCommand('copy');
	document.body.removeChild(t);
	
	alert("클립보드에 복사되었습니다.");
}
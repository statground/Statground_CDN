// 만든 사람들
function insert_people(){
	function getHtml(name, role, imageURL, facebookURL) {
		html = '<div class="col-xl-3 col-lg-3 col-md-3 mt-3">'
		html += '<div class="card bg-transparent border-0 text-center">'

		html += '<div class="card-img">'

		html += '<img loading="lazy" decoding="async" src="' + imageURL + '" class="rounded w-100" width="300" height="332" />'

		html += '<ul class="card-social list-inline">'
		html += '<li class="list-inline-item">'
		html += '<a href="' + facebookURL + '" target="_blank">'
		html += '<i class="fa-brands fa-square-facebook"></i>'
		html += '</a>'
		html += '</li>'
		html += '</ul>'

		html += '</div>'

		html += '<div class="card-body">'
		html += '<h5>' + name + '</h5>'
		html += '<p style="font-size:small;">' + role + '</p>'
		html += '</div>'

		html += '</div>'
		html += '</div>'

		$("#div_people").append(html)
	}

	getHtml(name="Jae-seong Yoo",
			role="CEO",
			imageURL="https://cdn.jsdelivr.net/gh/statground/Statground_CDN/assets/images/admin/Yoo.jpg",
			facebookURLL="https://www.facebook.com/JSYoo86")

	getHtml(name="Jae-kwang Kim",
			role="Technical Advisor",
			imageURL="https://cdn.jsdelivr.net/gh/statground/Statground_CDN/assets/images/admin/Kim.jpg",
			facebookURLL="https://www.facebook.com/profile.php?id=100013068106711")

	getHtml(name="Seung-sik Hwang",
			role="Admin. of Community",
			imageURL="https://cdn.jsdelivr.net/gh/statground/Statground_CDN/assets/images/admin/Hwang.jpg",
			facebookURLL="https://www.facebook.com/seungsik.hwang")

	getHtml(name="Keon-woong Moon",
			role="Admin. of Web-R",
			imageURL="https://cdn.jsdelivr.net/gh/statground/Statground_CDN/assets/images/admin/Moon.jpg",
			facebookURLL="https://www.facebook.com/cardiomoon")
}


// 파트너십
function insert_partnership(){
	function getHtml(title, description, logoURL, homepageURL) {
		html = '<div class="col-xl-2 col-lg-3 col-md-4 mt-2">'
		html += '<div class="card bg-transparent border-0 text-center">'

		html += '<div class="card-img">'
		html += '<img loading="lazy" decoding="async" src="' + logoURL + '" class="rounded w-100" width="300" height="332" />'

		html += '<ul class="card-social list-inline">'
		html += '<li class="list-inline-item">'
		html += '<a href="' + homepageURL + '" target="_blank">'
		html += '<i class="fa-solid fa-house"></i>'
		html += '</a>'
		html += '</li>'
		html += '</ul>'

		html += '</div>'

		html += '<div class="card-body">'
		html += '<h6>' + title + '</h6>'
		html += '<p style="font-size:x-small;">' + description + '</p>'
		html += '</div>'

		html += '</div>'
		html += '</div>'

		$("#div_partnership").append(html)
	}

	getHtml(title="(주)바이풀디자인",
			description="온라인 콘텐츠 제작, 수정 및 운영 계약",
			logoURL="https://cdn.jsdelivr.net/gh/statground/Statground_CDN/assets/images/partnership/by_fulldesign.jpg",
			homepageURL="http://byfulldesign.co.kr/")

	getHtml(title="(주)KB국민카드",
			description="데이터 비즈(Data Biz) 파트너 계약",
			logoURL="https://cdn.jsdelivr.net/gh/statground/Statground_CDN/assets/images/partnership/kbkookmincard.jpg",
			homepageURL="https://card.kbcard.com/")
	
	getHtml(title="슬기로운 통계생활",
			description="사업 협력 계약",
			logoURL="https://cdn.jsdelivr.net/gh/statground/Statground_CDN/assets/images/partnership/statisticsplaybook.jpg",
			homepageURL="https://statisticsplaybook.com/")

	getHtml(title="(주)인사이트마이닝",
			description="공동 연구, 정보와 자료 교환, 장비와 인력 교류 등을 통한 업무 협약",
			logoURL="https://cdn.jsdelivr.net/gh/statground/Statground_CDN/assets/images/partnership/insightmining.jpg",
			homepageURL="http://insightmining.co.kr/")

	getHtml(title="(사)AI프렌즈학회",
			description="기업 회원, 공동 세미나 진행",
			logoURL="https://cdn.jsdelivr.net/gh/statground/Statground_CDN/assets/images/partnership/aifrenz.jpg",
			homepageURL="https://aifrenz.notion.site/")

	getHtml(title="(주)LG CNS",
			description="Data lake 포털 구축 아웃소싱",
			logoURL="https://cdn.jsdelivr.net/gh/statground/Statground_CDN/assets/images/partnership/LGCNS.jpg",
			homepageURL="https://www.lgcns.com/")
}

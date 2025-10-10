// Section
function html_section(header, title, subtitle, contentID, divID){
	html = '<section class="section teams">'
	html += '<div class="container">'
	html += '<div class="row justify-content-center">'
	html += '<div class="col-12">'
	html += '<div class="section-title text-center">'
	html += '<p class="text-primary text-uppercase fw-bold mb-3">' + header + '</p>'
	html += '<h1>' + title + '</h1>'
	html += '<p class="mb-0">' + subtitle + '</p>'
	html += '</div>'
	html += '</div>'
	html += '</div>'
	html += '<div class="row position-relative" id="' + contentID + '"></div>'
	html += '</div>'
	html += '</section>'
	$("#" + divID).append(html)
}


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


	$.ajax({
		url : "/intro/get_intro_people",
		success:function(data){
            $("#div_people_section").html("")

            html_section("People", "만든 사람들", "통계마당을 만들어나가고 있는 사람들이에요.", "div_people", "div_people_section");
			for (var key in data) {
				getHtml(name=data[key].name, role=data[key].role, imageURL=data[key].url_image, facebookURL=data[key].url_facebook)
			}
		}
	})
}


// 파트너십과 주요 고객사
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

	
	$.ajax({
		url : "/intro/get_intro_partnership",
		success:function(data){
            $("#div_partnership_section").html("")

            html_section("Partnerships", "파트너십과 주요 고객사", "통계마당과 함께 미래를 도모한 업체들입니다.", "div_partnership", "div_partnership_section");
			for (var key in data) {
				getHtml(title=data[key].title, description=data[key].description, logoURL=data[key].url_logo, homepageURL=data[key].url_homepage)
			}
		}
	})
}
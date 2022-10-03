// 커뮤니티
function insert_community(){
	// 데이터 로딩 전 timeline Html
	function getHtml_init() {
		html = '<div class="col-lg-4 col-md-6 pt-1">'
		html += '<div class="shadow rounded bg-white p-4 mt-4">'

		html += '<div class="d-block d-sm-flex align-items-center mb-3">'
		html += '<div class="mt-3 mt-sm-0 ms-0 ms-sm-3"></div>'
		html += '</div>'

		html += '<div class="content">'
		html += '<center>'
		html += '<img loading="lazy" decoding="async" src="https://cdn.jsdelivr.net/gh/praster1/statground_cdn/images/loading-pulse.gif" />'
		html += '</center>'
		html += '</div>'

		html += '</div>'
		html += '</div>'

		$("#div_community_timeline").append(html)
	}

	for (i = 0 ; i < 3 ; i++) { getHtml_init() }

	
	// 데이터 로딩 후
	function getHtml_header(memberCount, timelineCount) {
		html = '<p class="text-primary text-uppercase fw-bold mb-3">Community</p>'

		html += '<h2 class="mb-4">'
		html += '현재 ' + numberWithCommas(memberCount.toString()) + '명이<br/>통계마당을 이용하고 있습니다.'
		html += '</h2>'

		html += '<p class="lead mb-0">최근 30일 동안 ' + numberWithCommas(timelineCount.toString()) + '개의 글이 올라왔어요.</p>'
		
		return html
	}

	function getHtml_timeline(username, datetime, content) {
		html = '<div class="col-lg-4 col-md-6 pt-1">'
		html += '<div class="shadow rounded bg-white p-4 mt-4">'
		
		html += '<div class="d-block d-sm-flex align-items-center mb-3">'
		
		html += '<div class="mt-3 mt-sm-0 ms-0 ms-sm-3">'
		html += '<h4 class="h5 mb-1">' + username.toString() +'</h4>'
		html += '<p class="mb-0">'+ datetime.toString() +'</p>'
		html += '</div>'
		html += '</div>'
		
		html += '<div class="content">'
		html += textLengthOverCut(content.toString(), 125)
		html += '</div>'

		html += '</div>'
		html += '</div>'
		
		return html
	}

	$.ajax({
		url : "/get_index_famous_timeline/",
		success:function(data){
			$(".div_community_header_loader").remove()

			// div_community_header
			$("#div_community_header").html(getHtml_header(data.memberCount.members, data.timelineCount))


			// div_community_timeline
			$("#div_community_timeline").html("")
			html = ""
			for (i = 0 ; i < data.timeline.length ; i++) {
				html += getHtml_timeline( data.timeline[i].username, data.timeline[i].time, data.timeline[i].text)
			}
			$("#div_community_timeline").append(html)
		}
	})
}



// Web-R
function insert_webr()
{
	$.ajax({
		url : "/get_index_webr/",
		success:function(data){
			$("#div_webr_usercount").html("")
			$("#div_webr_usercount").html(html_userCount(data.userCount))

			$("#div_webr_article").html("")
			$("#div_webr_article").html(html_article(data.recentlyArticle.nick_name, data.recentlyArticle.title, data.recentlyArticle.regdate))

			$("#div_webr_book").html("")
			$("#div_webr_book").html(html_book(data.book.image, data.book.title, data.book.description))
		}
	})

	function html_userCount(userCount) {
		html = '<h3 class="mb-3">Web-R 접속</h3>'
		html += '<p class="mb-0">'
		html += '현재 ' + numberWithCommas(userCount.toString()) + '명의 회원이, 웹에서 하는 ggplot2, Propensity Score Matching, 다중 검정 등을 이용하고 있어요.'
		html += '</p>'

		return html
	}

	function html_article(username, title, regdate) {
		regdate = regdate.substring(0, 4) + "-" + regdate.substring(5, 7) + regdate.substring(8, 10)
		
		html = '<h3 class="mb-3">자유게시판</h3>'
		html += '<p class="mb-0">' + textLengthOverCut(title.toString(), 50) + ' (' + regdate + ')</p>'
		html += '<p class="mb-0" color="black" style="font-size:small;">' 
		html += '<i class="fa-solid fa-user"></i>&nbsp;&nbsp;'
		html += username.toString()
		html += '</p>'

		return html
	}



	function html_book(imageURL, title, description) {
		html = '<div class="icon me-4 mb-4 mb-sm-0">'
		html += '<img src="' + imageURL.toString() + '" style="width:75px; height:100px">'
		html += '</div>'

		html += '<div class="block">'
		html += '<h3 class="mb-3">' + title.toString() + '</h3>'
		html += '<p class="mb-0">' + textLengthOverCut(description.toString(), 100) + '</p>'
		html += '</div>'

		return html
	}
}



// Toy Projects
function insert_toy_project(){
	function getHtml(imageURL, linkURL){
		html = '<div class="icon-box-item text-center col-lg-3 col-md-6 mb-3">'
		html += '<div class="rounded shadow py-5 px-4">'

		html += '<img src="' + imageURL + '">'
		html += '<h3 class="mb-3"></h3>'
		html += '<a class="btn btn-sm btn-outline-primary" href="' + linkURL + '">'
		html += '바로가기'
		html += '</a>'

		html += '</div>'
		html += '</div>'

		$("#div_toy_project").append(html)
	}

	getHtml("https://cdn.jsdelivr.net/gh/statground/Statground_CDN/assets/images/banners/toys_youtube.png", "/youtube_metrics")
	getHtml("https://cdn.jsdelivr.net/gh/statground/Statground_CDN/assets/images/banners/toys_smartstore.png", "/smartstore")
	getHtml("https://cdn.jsdelivr.net/gh/statground/Statground_CDN/assets/images/banners/toys_game_correlation.png", "/toys/correlation")
	getHtml("https://cdn.jsdelivr.net/gh/statground/Statground_CDN/assets/images/banners/toys_game_cluster.png", "/toys/cluster")
}
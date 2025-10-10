function get_index_famous_timeline()
{
	$.ajax({
		url : "/get_index_famous_timeline/",
		success:function(data){
			$(".div_community_header_loader").remove()

			// div_community_header
			$("#div_community_header").html(html_header(data.memberCount.members, data.timelineCount))


			console.log(data.timeline)
			$("#div_community_timeline").html("")
			html = ""
			for (i = 0 ; i < data.timeline.length ; i++) {
				html += html_timeline( data.timeline[i].username, data.timeline[i].time, data.timeline[i].text)
			}
			$("#div_community_timeline").append(html)
		}
	})


	function html_header(memberCount, timelineCount) {
		html = '<p class="text-primary text-uppercase fw-bold mb-3">Community</p>'

		html += '<h1 class="mb-4">'
		html += '현재 ' + numberWithCommas(memberCount.toString()) + '명이 통계마당을 이용하고 있습니다.'
		html += '</h1>'

		html += '<p class="lead mb-0">최근 30일 동안 ' + numberWithCommas(timelineCount.toString()) + '개의 글이 올라왔어요.</p>'
		return html
	}


	function html_timeline(username, datetime, content) {
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
}
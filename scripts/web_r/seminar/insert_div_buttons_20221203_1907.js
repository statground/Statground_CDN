function insert_div_buttons()
{
	$.ajax({
		url : "/seminar/ajax_get_success_count/",
		success:function(data){
			$("#div_buttons").html("")

			html = '현재 수강 인원: ' + data.success_count.toString() + '명 / 50명'
			html += '<br/><br/>'

			if (data.success_count >= 50) {
				html += '<button type="button" class="btn btn-warning" disabled>'
				html += '정원이 초과되어 마감되었습니다.'
				html += '</button>'

			} else {
				html += '<button type="button" class="btn btn-warning" onclick="location.href=\'/seminar/application\'">'
				html += '수강 신청 하기'
				html += '</button>'
			}

			html += '&nbsp;'
			html += '<button type="button" class="btn btn-info" onclick="location.href=\'/seminar/confirm\'">'
			html += '등록 확인'
			html += '</button>'
			
			$("#div_buttons").html(html)
		}
	})
}
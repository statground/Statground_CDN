function setBtnWrite(locURL) {
	$.ajax({
		url : "/get_user_info/",
		success:function(data){		
			$("#btnWrite").html("")
			html = ""
		
			if (data.group_info.uuid.toString() != "961f0790-d788-11ec-9d64-0242ac120002")
			{
				html = '<button class="btn notika-btn-green btn-reco-mg btn-button-mg" id="btnWrite" name="btnWrite" onclick="location.href=\'/' + locURL + '/write/\'">'
				html += '<span style="color:white">글쓰기</span>'
				html += '</button>'
			}
			else
			{
				html = '<button class="btn notika-btn-green btn-reco-mg btn-button-mg" disabled>'
				html += '<span style="color:white">'
				html += '새 글을 쓰려면 이메일 인증이 필요합니다.'
				html += '</span>'
				html += '</button>'
			}
			
			$("#btnWrite").html(html)
		}
	})
}
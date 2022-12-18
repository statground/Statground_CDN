function setBtnWrite() {
	$.ajax({
		url : "/get_user_info/",
		success:function(data){		
			if (data.group_info.uuid.toString() != "961f0790-d788-11ec-9d64-0242ac120002")
			{
				$("#btnWrite").html("")
				
				html = '<button class="btn notika-btn-green btn-reco-mg btn-button-mg" id="btnWrite" name="btnWrite" onclick="location.href=\'/community/write/\'">'
				html += '<span style="color:white">글쓰기</span>'
				html += '</button>'
				$("#btnWrite").html(html)
			}
		}
	})
}